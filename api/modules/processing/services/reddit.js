import { genericUserAgent, maxVideoDuration } from "../../config.js";
import { getCookie, updateCookieValues } from "../cookie/manager.js";

async function getAccessToken() {
    /* "cookie" in cookiefile needs to contain:
     * client_id, client_secret, refresh_token
     * e.g. client_id=bla; client_secret=bla; refresh_token=bla
     *
     * you can get these by making a reddit app and
     * authenticating an account against reddit's oauth2 api
     * see: https://github.com/reddit-archive/reddit/wiki/OAuth2
     * 
     * any additional cookie fields are managed by this code and you
     * should not touch them unless you know what you're doing. **/
    const cookie = await getCookie('reddit');
    if (!cookie) return;

    const values = cookie.values(),
          needRefresh = !values.access_token
                        || !values.expiry
                        || Number(values.expiry) < new Date().getTime();
    if (!needRefresh) return values.access_token;

    const data = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            'authorization': `Basic ${Buffer.from(
                [values.client_id, values.client_secret].join(':')
            ).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': genericUserAgent,
            'accept': 'application/json'
        },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(values.refresh_token)}`
    }).then(r => r.json()).catch(_ => {});
    if (!data) return;

    const { access_token, refresh_token, expires_in } = data;
    if (!access_token) return;

    updateCookieValues(cookie, {
        ...cookie.values(),
        access_token, refresh_token,
        expiry: new Date().getTime() + (expires_in * 1000),
    });

    return access_token;
}

export default async function(obj) {
    const url = new URL(`https://www.reddit.com/r/${obj.sub}/comments/${obj.id}.json`);

    const accessToken = await getAccessToken();
    if (accessToken) url.hostname = 'oauth.reddit.com';

    let data = await fetch(
        url, { headers: accessToken && { authorization: `Bearer ${accessToken}` } }
    ).then((r) => { return r.json() }).catch(() => { return false });
    if (!data) return { error: 'ErrorCouldntFetch' };

    data = data[0]["data"]["children"][0]["data"];

    if (data.url.endsWith('.gif')) return { typeId: 1, urls: data.url };

    if (!("reddit_video" in data["secure_media"])) return { error: 'ErrorEmptyDownload' };
    if (data["secure_media"]["reddit_video"]["duration"] * 1000 > maxVideoDuration) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let audio = false,
        video = data["secure_media"]["reddit_video"]["fallback_url"].split('?')[0],
        audioFileLink = video.match('.mp4') ? `${video.split('_')[0]}_audio.mp4` : `${data["secure_media"]["reddit_video"]["fallback_url"].split('DASH')[0]}audio`;

    await fetch(audioFileLink, { method: "HEAD" }).then((r) => { if (Number(r.status) === 200) audio = true }).catch(() => { audio = false });

    // fallback for videos with variable audio quality
    if (!audio) {
        audioFileLink = `${video.split('_')[0]}_AUDIO_128.mp4`
        await fetch(audioFileLink, { method: "HEAD" }).then((r) => { if (Number(r.status) === 200) audio = true }).catch(() => { audio = false });
    }

    let id = video.split('/')[3];

    if (!audio) return { typeId: 1, urls: video };
    return {
        typeId: 2,
        type: "render",
        urls: [video, audioFileLink],
        audioFilename: `reddit_${id}_audio`,
        filename: `reddit_${id}.mp4`
    };
}
