import { genericUserAgent, maxVideoDuration } from "../../config.js";

// TO-DO: higher quality downloads (currently requires an account)

function com_resolveShortlink(shortId) {
    return fetch(`https://b23.tv/${shortId}`, { redirect: 'manual' })
            .then(r => r.status > 300 && r.status < 400 && r.headers.get('location'))
            .then(url => {
                if (!url) return;
                const path = new URL(url).pathname;
                if (path.startsWith('/video/'))
                    return path.split('/')[2];
            })
            .catch(() => {})
}

function getBest(content) {
    return content?.filter(v => v.baseUrl || v.url)
                .map(v => (v.baseUrl = v.baseUrl || v.url, v))
                .reduce((a, b) => a?.bandwidth > b?.bandwidth ? a : b);
}

function extractBestQuality(dashData) {
    const bestVideo = getBest(dashData.video),
          bestAudio = getBest(dashData.audio);

    if (!bestVideo || !bestAudio) return [];
    return [ bestVideo, bestAudio ];
}

async function com_download(id) {
    let html = await fetch(`https://bilibili.com/video/${id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });
    if (!html) return { error: 'ErrorCouldntFetch' };

    if (!(html.includes('<script>window.__playinfo__=') && html.includes('"video_codecid"'))) {
        return { error: 'ErrorEmptyDownload' };
    }

    let streamData = JSON.parse(html.split('<script>window.__playinfo__=')[1].split('</script>')[0]);
    if (streamData.data.timelength > maxVideoDuration) {
        return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    }

    const [ video, audio ] = extractBestQuality(streamData.data.dash);
    if (!video || !audio) {
        return { error: 'ErrorEmptyDownload' };
    }

    return {
        urls: [video.baseUrl, audio.baseUrl],
        audioFilename: `bilibili_${id}_audio`,
        filename: `bilibili_${id}_${video.width}x${video.height}.mp4`
    };
}

async function tv_download(id) {
    const url = new URL(
        'https://api.bilibili.tv/intl/gateway/web/playurl'
        + '?s_locale=en_US&platform=web&qn=64&type=0&device=wap'
        + '&tf=0&spm_id=bstar-web.ugc-video-detail.0.0&from_spm_id='
    );

    url.searchParams.set('aid', id);

    const { data } = await fetch(url).then(a => a.json());
    if (!data?.playurl?.video) {
        return { error: 'ErrorEmptyDownload' };
    }

    const [ video, audio ] = extractBestQuality({
        video: data.playurl.video.map(s => s.video_resource)
                                 .filter(s => s.codecs.includes('avc1')),
        audio: data.playurl.audio_resource
    });

    if (!video || !audio) {
        return { error: 'ErrorEmptyDownload' };
    }

    if (video.duration > maxVideoDuration) {
        return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    }

    return {
        urls: [video.url, audio.url],
        audioFilename: `bilibili_tv_${id}_audio`,
        filename: `bilibili_tv_${id}.mp4`
    };
}

export default async function({ comId, tvId, comShortLink }) {
    if (comShortLink) {
        comId = await com_resolveShortlink(comShortLink);
    }

    if (comId) {
        return com_download(comId);
    } else if (tvId) {
        return tv_download(tvId);
    }

    return { error: 'ErrorCouldntFetch' };
}
