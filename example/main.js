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

    const prompt = 'Generate a very happy songs with a catchy melody and a positive message.';

    // Generated songs with the given prompt
    let songInfoA = await suno.generateSongs(prompt);

    // OR Separate requests
    let requestIds = await suno.generateToRequestIds(prompt);
    let songInfoB = await suno.requestIdsToMetadata(requestIds);

    // Save the generated songs
    const outputDir = './output';
    await suno.saveSongs(songInfoA, outputDir);
    await suno.saveSongs(songInfoB, outputDir);
    // songInfoA is equivalent to songInfoB

    // Get all the generated songs
    const songs = await suno.getGeneratedSongs();
    console.log(songs);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();

