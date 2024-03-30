const { SunoAI } = require('../src');

async function main() {
  try {

    // Initialize the sunoAI class with the cookie
    const cookie = '__client=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudF8yZURxYWpiYVljakN2clVWT3hGOWxvc0pWeW8iLCJyb3RhdGluZ190b2tlbiI6ImplbTQ1YjNmNmwzM21vaTR4OTZtN3h4Mm5vaDExYTdyczY1MDNweGsifQ.i5mmF1WRGOZ_QsTG0Eym22T7PJ_Yp_XDLNW4FCCh907NiF01avVhP-z0chrGnclS25Pv-hHZOCnquhlGBRzFCxi3rqRafmool-QUtNx-PtGtyRXmL9krfrMrdRz8qivhcfuDeL6qvMKPTrsQHtDXY_aOSiALTjNWF5B2k_0AITQptVgPQ5QLeX9zleh3k5bWhy-Yy_C8o6yTyLCFVvPTtO96fMwjhSfmvwJvstZJd8dw3UFJE_9K0WSJSpj2iocWs2rykGd7zGmiw_Oib-kTnbzZ-ZJ4-4AOxr_uKntaHzmwN2bNCSN7oUcR5W556xW7aJDCIDQvQYwhVgOs6mO2iA; __client_uat=1711450962; _cfuvid=fy29oUsNDZy1qsgveu7cmy04BTUxH1DdFkC9V0M_SIE-1711513617632-0.0.1.1-604800000; __cf_bm=jZUFOHmM53ZqCcVzx44mAR_2wTjyJwpnvG6f4pQTm0s-1711554925-1.0.1.1-drEc.b6dVdTXlJ4U1goVJ74MSaudYGVdpV6sdJSBHRG_mN2926yzLhBvRVgDBZJEfRFO449XKFCoamFwaNiakg; mp_26ced217328f4737497bd6ba6641ca1c_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A18e7a5752c9cd8-033ae672ea81fb-7e433c49-157188-18e7a5752c9cd8%22%2C%22%24device_id%22%3A%20%2218e7a5752c9cd8-033ae672ea81fb-7e433c49-157188-18e7a5752c9cd8%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D';
    const suno = new SunoAI(cookie);

    //You must call init() before any other methods using async/await
    await suno.init();

    // Get the number of requests left
    let limit = await suno.getLimitLeft();
    console.log(`${limit} songs left`);

    /*
    Some example payloads:

    1. Generate a song with a prompt
    {
        "gpt_description_prompt": "a syncopated blues song about how you're always there for me",
        "mv": "chirp-v3-0",
        "prompt": "",
        "make_instrumental": false
    }
    or a pure song
    {
        "gpt_description_prompt":"a syncopated funk song about dancing with you for the last time",
        "mv":"chirp-v3-0",
        "prompt":"",
        "make_instrumental":true
    }

    2. Generate a song with your own lyrics
    {
        "prompt": "the first line\nthe secound line\nthe third line",
        "tags": "dreamy kids music",
        "mv": "chirp-v3-0",
        "title": "Lines",
        "make_instrumental": false,
        "continue_clip_id": null,
        "continue_at": null
    }

    3. Continue to generate a song from a specific point in a song
    {
        "prompt":"",
        "tags":"futuristic jazz",
        "mv":"chirp-v3-0",
        "title":"",
        "continue_clip_id":"d55b5269-6bad-4f61-a8f5-871fb124044d",
        "continue_at":109
    }
    or remix it and continue
    {
        "prompt":"[Verse]\nWalking down the street, nobody takes a second glance\nLost in the crowd, I'm just a faceless passerby (oh-oh-oh)\nBut I refuse to blend in, I won't fade into the grey\nGonna paint this town with vibrant colors, watch me fly high\n\n[Verse 2]\nIn a world of trends and fashion, I stick out like a sore thumb\nBut I'm proud to be different, I won't apologize (oh-oh-oh)\nI'm not gonna play the game, I won't follow the rules\nGonna carve my own path, let my spirit rise\n\n[Chorus]\nHey world, take a look at me now (look at me now)\nI'm the one you overlooked, but now I'm breaking out (oh-oh-oh)\nI'm gonna dance to my own beat, gonna sing my own song (sing it loud)\nI won't be lost in the shuffle for too long (too long)",
        "tags":"electronic hip hop",
        "mv":"chirp-v3-0",
        "title":"Lost in the Shuffle",
        "continue_clip_id":"62ed33cb-f802-47d3-a233-9a7f3fc804a3",
        "continue_at":90.36
    }
    */
    const payload = {
      gpt_description_prompt: null,// Use this prompt to generate lyrics
      prompt: null, // Your own lyrics
      tags: null, // style
      make_instrumental: false,// is pure music (without lyrics)
      title: null, // title
      mv: 'chirp-v3-0',// video style, option("chirp-v2-xxl-alpha")
      continue_clip_id: null,// Continue to generate song id
      continue_at: null// Continue generation from this seconds
    };

    // Generated songs with payload
    let songInfo = await suno.generateSongs(payload);

    // OR Separate requests
    let requestIds = await suno.getRequestIds(payload);
    let songInfoB = await suno.getMetadata(requestIds);// Equivalent to songInfo

    // Save the generated songs
    const outputDir = './output';
    await suno.saveSongs(songInfo, outputDir);

    // Get the specified songs
    const ids = ['79742cdf-86c9-432f-81f2-8c2126de42d9', 'ae5ccb5-f4f8-49c9-8f5c-192e43ed9b0c', '0bba671e-b071-4da8-99e7-361b4c69f8b3'];
    const anySongs = await suno.getMetadata(ids);

    // Get all the generated songs
    const allSongs = await suno.getAllSongs();
    const allSongsB = await suno.getMetadata(); // Equivalent to allSongs

    // AI generate lyrics with prompt
    let lyrics = await suno.generateLyrics("hissin in the kitchen");
    console.log(lyrics);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();

