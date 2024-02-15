export default async function(obj) {
    let video = await fetch(`https://api.streamable.com/videos/${obj.id}`).then((r) => { return r.status === 200 ? r.json() : false }).catch(() => { return false });
    if (!video) return { error: 'ErrorEmptyDownload' };

    let best = video.files['mp4-mobile'];
    if (video.files.mp4 && (obj.isAudioOnly || obj.quality === "max" || obj.quality >= 720)) {
        best = video.files.mp4;
    }

    if (best) return {
        urls: best.url,
        filename: `streamable_${obj.id}_${best.width}x${best.height}.mp4`,
        audioFilename: `streamable_${obj.id}_audio`,
        fileMetadata: {
            title: video.title
        }
    }
    return { error: 'ErrorEmptyDownload' }
}
