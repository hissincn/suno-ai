const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://studio-api.suno.ai';
const maxRetryTimes = 5;

class SunoAI {
    constructor(cookie) {
        this.cookie = cookie;
        this.headers = {
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Cookie": cookie
        };
        this.sid = null;
        this.retryTime = 0;

        // Keep the token fresh
        this.authUpdateTime = null;
        axios.interceptors.request.use(async (config) => {
            if (this.retryTime > maxRetryTimes) {
                throw new Error('Fail to retry because of too many times.');
            }
            if (config.url.startsWith(baseUrl)) {
                if (!this.authUpdateTime || Date.now() - this.authUpdateTime > 45000) {
                    await this._renew();
                }
                config.headers = this.headers;
            }
            return config;
        });
        axios.interceptors.response.use(
            async (response) => {
                if (response.config.url.startsWith(baseUrl) && response.data?.detail === 'Unauthorized') {
                    this.retryTime += 1;
                    response = await axios.request(response.config);
                }
                else {
                    this.retryTime = 0;
                }
                return response;
            },
            async (error) => {
                if (error.config.url.startsWith(baseUrl) && error.response?.status === 401) {
                    this.retryTime += 1;
                    error.response = await axios.request(error.config);
                }
                else {
                    this.retryTime = 0;
                }
                return error.response;
            }
        );
    }

    async init() {
        try {
            const response = await axios.request({
                method: 'GET',
                url: 'https://clerk.suno.ai/v1/client',
                params: { _clerk_js_version: '4.70.5' },
                headers: {
                    Cookie: this.cookie
                }
            })
            const data = response.data;
            const r = data.response;
            let sid;
            if (r) {
                sid = r.last_active_session_id;
            }
            if (!sid) {
                throw new Error('Failed to get session id');
            }
            this.sid = sid;
            await this._renew();
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    // For every session, authorization token is valid for 60s.
    async _renew() {
        try {
            const tokenResponse = await axios.request({
                method: 'POST',
                url: `https://clerk.suno.ai/v1/client/sessions/${this.sid}/tokens/api?_clerk_js_version=4.70.5`,
                headers: {
                    Cookie: this.cookie
                }
            })
            const tokenData = tokenResponse.data;
            const token = tokenData?.jwt;
            this.headers.Authorization = `Bearer ${token}`;
            this.authUpdateTime = Date.now();
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getLimitLeft() {
        const response = await axios.request({
            method: 'GET',
            url: `${baseUrl}/api/billing/info/`
        })
        const data = response.data;
        return Math.floor(data.total_credits_left / 10);
    }

    async getRequestIds(payload) {
        if (!payload) {
            throw new Error('Payload is required');
        }
        try {
            const response = await axios.post(`${baseUrl}/api/generate/v2/`, payload);
            if (response.status !== 200) {
                console.error(response.statusText);
                throw new Error(`Error response ${response.status}`);
            }

            const responseBody = response.data;
            const songsMetaInfo = responseBody.clips;
            const requestIds = songsMetaInfo.map(info => info.id);
            console.log(requestIds);

            return requestIds;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getMetadata(ids) {
        try {
            // Retry if the song is not generated
            let retryTimes = 0;
            const maxRetryTimes = 20;

            let params = {};
            if (ids && ids.length > 0) {
                params.ids = ids.join(',');
            }

            while (true) {
                const response = await axios.request({
                    method: 'GET',
                    url: `${baseUrl}/api/feed/`,
                    params
                });

                let data = response?.data;

                if (data[0]?.audio_url && data[1]?.audio_url) {
                    return data;
                }
                else {
                    if (retryTimes > maxRetryTimes) {
                        throw new Error('Failed to generating song');
                    }
                    else {
                        console.log('Retrying...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        retryTimes += 1;
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async generateSongs(payload) {
        try {
            const requestIds = await this.getRequestIds(payload);
            const songsInfo = await this.getMetadata(requestIds);
            return songsInfo;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async saveSongs(songsInfo, outputDir) {
        try {
            // Create the output directory if it does not exist
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            for (let i = 0; i < songsInfo.length; i++) {
                let songInfo = songsInfo[i];
                let title = songInfo.title;
                let lyric = songInfo.metadata.prompt.replace(/\[.*?\]/g, '');
                let audio_url = songInfo.audio_url;
                let image_large_url = songInfo.image_large_url;
                let fileName = `${title.replace(/ /g, '_')}_${i}`;

                console.log(`Saving ${fileName}`);

                const jsonPath = path.join(outputDir, `${fileName}.json`);
                const mp3Path = path.join(outputDir, `${fileName}.mp3`);
                const lrcPath = path.join(outputDir, `${fileName}.lrc`);
                const imagePath = path.join(outputDir, `${fileName}.png`);

                // Save the info
                fs.writeFileSync(jsonPath, JSON.stringify(songInfo, null, 2), 'utf-8');
                console.log("Info downloaded");

                // Save the lyric
                // ！！！！！！！waiting for processing
                fs.writeFileSync(lrcPath, `${title}\n\n${lyric}`, 'utf-8');
                console.log("Lyric downloaded");

                // Save the cover image
                const imageResponse = await axios.get(image_large_url, { responseType: 'stream' });
                if (imageResponse.status !== 200) {
                    throw new Error('Could not download image');
                }
                const imageFileStream = fs.createWriteStream(imagePath);
                imageResponse.data.pipe(imageFileStream);
                await new Promise((resolve, reject) => {
                    imageFileStream.on('finish', resolve);
                    imageFileStream.on('error', reject);
                });
                console.log("Cover image downloaded");

                // Download the song
                console.log("Song downloading...");
                const response = await axios.get(audio_url, { responseType: 'stream' });
                if (response.status !== 200) {
                    throw new Error('Could not download song');
                }
                const fileStream = fs.createWriteStream(mp3Path);
                response.data.pipe(fileStream);
                await new Promise((resolve, reject) => {
                    fileStream.on('finish', resolve);
                    fileStream.on('error', reject);
                });
                console.log("Song downloaded");
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getAllSongs() {
        try {
            const data = await this.getMetadata();
            return data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async generateLyrics(prompt) {
        try {
            const requestId = await axios.request({
                method: 'POST',
                url: `${baseUrl}/api/generate/lyrics/`,
                data: { prompt }
            })
            let id = requestId?.data?.id;
            while (true) {
                const response = await axios.request({
                    method: 'GET',
                    url: `${baseUrl}/api/generate/lyrics/${id}`,
                })
                let data = response?.data;
                if (data?.status==='complete') {
                    return data;
                }
                else {
                    // console.log('Retrying...');
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

}

module.exports = SunoAI;
