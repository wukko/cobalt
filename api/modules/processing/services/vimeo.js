import { maxVideoDuration } from "../../../core/config.js";
import { cleanString } from '../../util/misc.js';

const resolutionMatch = {
    "3840": "2160",
    "2732": "1440",
    "2560": "1440",
    "2048": "1080",
    "1920": "1080",
    "1366": "720",
    "1280": "720",
    "960": "480",
    "640": "360",
    "426": "240"
}

const qualityMatch = {
    "2160": "4K",
    "1440": "2K",
    "480": "540",

    "4K": "2160",
    "2K": "1440",
    "540": "480"
}

export default async function(obj) {
    let quality = obj.quality === "max" ? "9000" : obj.quality;
    if (!quality || obj.isAudioOnly) quality = "9000";

    const url = new URL(`https://player.vimeo.com/video/${obj.id}/config`);
    if (obj.password) {
        url.searchParams.set('h', obj.password);
    }

    let api = await fetch(url)
                    .then(r => r.json())
                    .catch(() => {});
    if (!api) return { error: 'ErrorCouldntFetch' };

    let downloadType = "dash";
    if (!obj.forceDash && JSON.stringify(api).includes('"progressive":[{')) downloadType = "progressive";

    let fileMetadata = {
        title: cleanString(api.video.title.trim()),
        artist: cleanString(api.video.owner.name.trim()),
    }

    if (downloadType !== "dash") {
        if (qualityMatch[quality]) quality = qualityMatch[quality];
        let all = api["request"]["files"]["progressive"].sort((a, b) => Number(b.width) - Number(a.width));
        let best = all[0];

        let bestQuality = all[0]["quality"].split('p')[0];
        bestQuality = qualityMatch[bestQuality] ? qualityMatch[bestQuality] : bestQuality;
        if (Number(quality) < Number(bestQuality)) best = all.find(i => i["quality"].split('p')[0] === quality);

        if (!best) return { error: 'ErrorEmptyDownload' };
        return {
            urls: best["url"],
            audioFilename: `vimeo_${obj.id}_audio`,
            filename: `vimeo_${obj.id}_${best["width"]}x${best["height"]}.mp4`
        }
    }

    if (api.video.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let masterJSONURL = api["request"]["files"]["dash"]["cdns"]["akfire_interconnect_quic"]["url"];
    let masterJSON = await fetch(masterJSONURL).then((r) => { return r.json() }).catch(() => { return false });

    if (!masterJSON) return { error: 'ErrorCouldntFetch' };
    if (!masterJSON.video) return { error: 'ErrorEmptyDownload' };

    let masterJSON_Video = masterJSON.video.sort((a, b) => Number(b.width) - Number(a.width)).filter(a => ["dash", "mp42"].includes(a['format'])),
        bestVideo = masterJSON_Video[0];
    if (Number(quality) < Number(resolutionMatch[bestVideo["width"]])) {
        bestVideo = masterJSON_Video.find(i => resolutionMatch[i["width"]] === quality)
    }

    let masterM3U8 = `${masterJSONURL.split("/sep/")[0]}/sep/video/${bestVideo.id}/master.m3u8`;
    const fallbackResolution = bestVideo.height > bestVideo.width ? bestVideo.width : bestVideo.height;

    return {
        urls: masterM3U8,
        isM3U8: true,
        fileMetadata: fileMetadata,
        filenameAttributes: {
            service: "vimeo",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            resolution: `${bestVideo.width}x${bestVideo.height}`,
            qualityLabel: `${resolutionMatch[bestVideo.width] || fallbackResolution}p`,
            extension: "mp4"
        }
    }
}
