import { genericUserAgent, maxVideoDuration } from "../../config.js";
import { cleanString } from "../../sub/utils.js";

const resolutions = {
    "ultra": "2160",
    "quad": "1440",
    "full": "1080",
    "hd": "720",
    "sd": "480",
    "low": "360",
    "lowest": "240",
    "mobile": "144"
}

export default async function(o) {
    let quality = o.quality === "max" ? "2160" : o.quality;

    let html = await fetch(`https://ok.ru/video/${o.id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then((r) => { return r.text() }).catch(() => { return false });

    if (!html) return { error: 'ErrorCouldntFetch' };
    if (!html.includes(`<div data-module="OKVideo" data-options="{`)) {
        return { error: 'ErrorEmptyDownload' };
    }

    let videoData = html.split(`<div data-module="OKVideo" data-options="`)[1].split('" data-')[0].replaceAll("&quot;", '"');
    videoData = JSON.parse(JSON.parse(videoData).flashvars.metadata);

    if (videoData.provider !== "UPLOADED_ODKL") return { error: 'ErrorUnsupported' };
    if (videoData.movie.is_live) return { error: 'ErrorLiveVideo' };
    if (videoData.movie.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let videos = videoData.videos.filter(v => !v.disallowed);
    let bestVideo = videos.find(v => resolutions[v.name] === quality) || videos[videos.length - 1];

    let fileMetadata = {
        title: cleanString(videoData.movie.title.trim()),
        author: cleanString(videoData.author.name.trim()),
    }

    if (bestVideo) return {
        urls: bestVideo.url,
        filenameAttributes: {
            service: "ok",
            id: o.id,
            title: fileMetadata.title,
            author: fileMetadata.author,
            resolution: `${resolutions[bestVideo.name]}p`,
            qualityLabel: `${resolutions[bestVideo.name]}p`,
            extension: "mp4"
        }
    }

    return { error: 'ErrorEmptyDownload' }
}
