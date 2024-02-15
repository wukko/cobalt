import HLS from 'hls-parser';
import { maxVideoDuration } from "../../config.js";
import { cleanString } from '../../sub/utils.js';

export default async function(obj) {
    let quality = obj.quality === "max" ? "9000" : obj.quality;
    let play = await fetch(`https://rutube.ru/api/play/options/${obj.id}/?no_404=true&referer&pver=v2`).then((r) => { return r.json() }).catch(() => { return false });
    if (!play) return { error: 'ErrorCouldntFetch' };

    if ("hls" in play.live_streams) return { error: 'ErrorLiveVideo' };
    if (!play.video_balancer || play.detail) return { error: 'ErrorEmptyDownload' };

    if (play.duration > maxVideoDuration) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    
    let m3u8 = await fetch(play.video_balancer.m3u8).then((r) => { return r.text() }).catch(() => { return false });
    if (!m3u8) return { error: 'ErrorCouldntFetch' };

    m3u8 = HLS.parse(m3u8).variants.sort((a, b) => Number(b.bandwidth) - Number(a.bandwidth));

    let bestQuality = m3u8[0];
    if (Number(quality) < bestQuality.resolution.height) {
        bestQuality = m3u8.find((i) => (Number(quality) === i["resolution"].height));
    }
    let fileMetadata = {
        title: cleanString(play.title.trim()),
        artist: cleanString(play.author.name.trim()),
    }

    return {
        urls: bestQuality.uri,
        isM3U8: true,
        filenameAttributes: {
            service: "rutube",
            id: play.id,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            resolution: `${bestQuality.resolution.width}x${bestQuality.resolution.height}`,
            qualityLabel: `${bestQuality.resolution.height}p`,
            extension: "mp4"
        },
        fileMetadata: fileMetadata
    }
}
