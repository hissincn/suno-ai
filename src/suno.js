const axios = require('axios');
const fs = require('fs');
const path = require('path');

const exchangeTokenUrlBase = 'https://clerk.suno.ai/v1/client/sessions/{sid}/tokens/api?_clerk_js_version=4.70.5';
const baseUrl = 'https://studio-api.suno.ai';

class SunoAI {
    constructor(cookie) {
        this.cookie = cookie;
        this.headers = {
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": "123",
            Cookie: cookie
        };
        this.sid = null;
        this.retryTime = 0;
        this.songInfoDict = {};
        this.nowData = {};
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

    async getLimitLeft() {
        const response = await axios.request({
            method: 'GET',
            url: `${baseUrl}/api/billing/info/`,
            headers: this.headers
        })
        const data = response.data;
        return Math.floor(data.total_credits_left / 10);
    }

    async _renew() {
        const exchangeTokenUrl = exchangeTokenUrlBase.replace('{sid}', this.sid);
        const tokenResponse = await axios.request({
            method: 'POST',
            url: exchangeTokenUrl,
            headers: {
                Cookie: this.cookie
            }
        })
        const tokenData = tokenResponse.data;
        const token = tokenData?.jwt;
        this.headers.Authorization = `Bearer ${token}`;
    }

    _parseLyrics(data) {
        const songName = data.title || '';
        const mt = data.metadata;
        if (!mt || !songName) {
            return ['', ''];
        }
        const lyrics = mt.prompt.replace(/\[.*?\]/g, '');
        return [songName, lyrics];
    }

    async _fetchSongsMetadata(ids) {
        const [id1, id2] = ids.slice(0, 2);
        const url = `${baseUrl}/api/feed/?ids=${id1}%2C${id2}`;
        try {
            const response = await axios.get(url, { headers: this.headers });
            let data = response.data;

            if (typeof data === 'object' && data.detail === 'Unauthorized') {
                console.log('Token expired, renewing...');
                this.retryTime += 1;
                if (this.retryTime > 2) {
                    const [songName, lyric] = this._parseLyrics(this.nowData[0]);
                    this.songInfoDict.song_name = songName;
                    this.songInfoDict.lyric = lyric;
                    this.songInfoDict.song_url = `https://audiopipe.suno.ai/?item_id=${id1}`;
                    console.log('will sleep 30 and try to download');
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    return true;
                }
                await this._renew();
                await new Promise(resolve => setTimeout(resolve, 5000));
                return false;
            } else if (!Array.isArray(data)) {
                data = [data];
            }

            this.nowData = data;
            for (const d of data) {
                if (d.audio_url) {
                    const [songName, lyric] = this._parseLyrics(d);
                    this.songInfoDict.song_name = songName;
                    this.songInfoDict.lyric = lyric;
                    this.songInfoDict.song_url = d.audio_url;
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.error(e);
            console.log('Will sleep 45s and get the music url');
            await new Promise(resolve => setTimeout(resolve, 45000));
            const [songName, lyric] = this._parseLyrics(this.nowData[0]);
            this.songInfoDict.song_name = songName;
            this.songInfoDict.lyric = lyric;
            this.songInfoDict.song_url = `https://audiopipe.suno.ai/?item_id=${ids[0]}`;
            return true;
        }
    }

    async getSongs(prompt, maxRetryTimes = 20) {
        const url = `${baseUrl}/api/generate/v2/`;
        const payload = {
            gpt_description_prompt: prompt,
            mv: 'chirp-v3-0',
            prompt: '',
            make_instrumental: false,
        };

        try {
            const response = await axios.post(url, payload, { headers: this.headers });
            if (response.status !== 200) {
                console.error(response.statusText);
                throw new Error(`Error response ${response.status}`);
            }

            const responseBody = response.data;
            const songsMetaInfo = responseBody.clips;
            const requestIds = songsMetaInfo.map(info => info.id);
            console.log('Waiting for generating...');
            let retryTimes = 0;
            while (true) {
                const songInfo = await this._fetchSongsMetadata(requestIds);
                if (!songInfo) {
                    console.log('Generating...');
                    if (retryTimes > maxRetryTimes) {
                        throw new Error('Failed to generating song');
                    }
                    else {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        retryTimes += 1;
                    }
                } else {
                    break;
                }
            }
            return this.songInfoDict;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async saveSong(prompt, outputDir) {
        try {
            await this.getSongs(prompt);
            const { song_name, lyric, song_url } = this.songInfoDict;

            fs.mkdirSync(outputDir, { recursive: true });

            console.log(song_url);
            console.log("Waiting for song to download...");
            const response = await axios.get(song_url, { responseType: 'stream' });
            if (response.status !== 200) {
                throw new Error('Could not download song');
            }

            const mp3Path = path.join(outputDir, `${song_name.replace(' ', '_')}.mp3`);
            const lrcPath = path.join(outputDir, `${song_name.replace(' ', '_')}.lrc`);

            const fileStream = fs.createWriteStream(mp3Path);
            response.data.pipe(fileStream);

            await new Promise((resolve, reject) => {
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });
            console.log("Song downloaded");

            fs.writeFileSync(lrcPath, `${song_name}\n\n${lyric}`, 'utf-8');
            console.log("Lyric downloaded");

            return {
                song_url: song_url,
                song_name: song_name,
                song_name_formatted: song_name.replace(' ', '_'),
                lyric: lyric
            }

        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async generateSong(prompt) {
        try {
            await this.getSongs(prompt);
            const { song_name, lyric, song_url } = this.songInfoDict;

            return {
                song_url: song_url,
                song_name: song_name,
                song_name_formatted: song_name.replace(' ', '_'),
                lyric: lyric
            }

        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getGeneratedSongs() {
        try {
            const response = await axios.get(`${baseUrl}/api/feed/`, { headers: this.headers });
            const data = response.data;
            return data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

module.exports = SunoAI;
