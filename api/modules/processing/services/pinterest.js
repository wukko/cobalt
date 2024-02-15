import { genericUserAgent } from "../../config.js";

const videoLinkBase = {
    "regular": "https://v1.pinimg.com/videos/mc/720p/",
    "story": "https://v1.pinimg.com/videos/mc/720p/"
}

export default async function(o) {
    let id = o.id, type = "regular";

    if (!o.id && o.shortLink) {
        id = await fetch(`https://api.pinterest.com/url_shortener/${o.shortLink}/redirect/`, { redirect: "manual" }).then((r) => {
            return r.headers.get("location").split('pin/')[1].split('/')[0]
        }).catch(() => {});
    }
    if (id.includes("--")) {
        id = id.split("--")[1];
        type = "story";
    }
    if (!id) return { error: 'ErrorCouldntFetch' };

    let html = await fetch(`https://www.pinterest.com/pin/${id}/`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });

    if (!html) return { error: 'ErrorCouldntFetch' };

    let videoLink = html.split(`"url":"${videoLinkBase[type]}`)[1]?.split('"')[0];
    if (!html.includes(videoLink)) return { error: 'ErrorEmptyDownload' };

    return {
        urls: `${videoLinkBase[type]}${videoLink}`,
        filename: `pinterest_${o.id}.mp4`,
        audioFilename: `pinterest_${o.id}_audio`
    }
}
