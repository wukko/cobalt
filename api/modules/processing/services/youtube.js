import { Innertube } from 'youtubei.js';
import { maxVideoDuration } from '../../config.js';
import { cleanString } from '../../sub/utils.js';

const yt = await Innertube.create();

const c = {
    h264: {
        codec: "avc1",
        aCodec: "mp4a",
        container: "mp4"
    },
    av1: {
        codec: "av01",
        aCodec: "mp4a",
        container: "mp4"
    },
    vp9: {
        codec: "vp9",
        aCodec: "opus",
        container: "webm"
    }
}

export default async function(o) {
    let info, isDubbed, quality = o.quality === "max" ? "9000" : o.quality; //set quality 9000(p) to be interpreted as max
    function qual(i) {
        if (!i.quality_label) {
            return;
        }

        return i.quality_label.split('p')[0].split('s')[0]
    }

    try {
        info = await yt.getBasicInfo(o.id, 'ANDROID');
    } catch (e) {
        return { error: 'ErrorCantConnectToServiceAPI' };
    }

    if (!info) return { error: 'ErrorCantConnectToServiceAPI' };

    if (info.playability_status.status !== 'OK') return { error: 'ErrorYTUnavailable' };
    if (info.basic_info.is_live) return { error: 'ErrorLiveVideo' };

    let bestQuality, hasAudio, adaptive_formats = info.streaming_data.adaptive_formats.filter(e => 
        e.mime_type.includes(c[o.format].codec) || e.mime_type.includes(c[o.format].aCodec)
    ).sort((a, b) => Number(b.bitrate) - Number(a.bitrate));

    bestQuality = adaptive_formats.find(i => i.has_video);
    hasAudio = adaptive_formats.find(i => i.has_audio);

    if (bestQuality) bestQuality = qual(bestQuality);
    if (!bestQuality && !o.isAudioOnly || !hasAudio) return { error: 'ErrorYTTryOtherCodec' };
    if (info.basic_info.duration > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };

    let checkBestAudio = (i) => (i.has_audio && !i.has_video),
        audio = adaptive_formats.find(i => checkBestAudio(i) && !i.is_dubbed);

    if (o.dubLang) {
        let dubbedAudio = adaptive_formats.find(i =>
            checkBestAudio(i) && i.language === o.dubLang && i.audio_track && !i.audio_track.audio_is_default
        );
        if (dubbedAudio) {
            audio = dubbedAudio;
            isDubbed = true
        }
    }
    let fileMetadata = {
        title: cleanString(info.basic_info.title.trim()),
        artist: cleanString(info.basic_info.author.replace("- Topic", "").trim()),
    }
    if (info.basic_info.short_description && info.basic_info.short_description.startsWith("Provided to YouTube by")) {
        let descItems = info.basic_info.short_description.split("\n\n");
        fileMetadata.album = descItems[2];
        fileMetadata.copyright = descItems[3];
        if (descItems[4].startsWith("Released on:")) {
            fileMetadata.date = descItems[4].replace("Released on: ", '').trim()
        }
    }

    let filenameAttributes = {
        service: "youtube",
        id: o.id,
        title: fileMetadata.title,
        author: fileMetadata.artist,
        youtubeDubName: isDubbed ? o.dubLang : false
    }

    if (filenameAttributes.title === "Video Not Available" && filenameAttributes.author === "YouTube Viewers")
        return {
            error: 'ErrorCantConnectToServiceAPI',
            critical: true
        }

    if (hasAudio && o.isAudioOnly) return {
        type: "render",
        isAudioOnly: true,
        urls: audio.url,
        filenameAttributes: filenameAttributes,
        fileMetadata: fileMetadata
    }
    const matchingQuality = Number(quality) > Number(bestQuality) ? bestQuality : quality,
        checkSingle = i => qual(i) === matchingQuality && i.mime_type.includes(c[o.format].codec),
        checkRender = i => qual(i) === matchingQuality && i.has_video && !i.has_audio;

    let match, type, urls;
    if (!o.isAudioOnly && !o.isAudioMuted && o.format === 'h264') {
        match = info.streaming_data.formats.find(checkSingle);
        type = "bridge";
        urls = match?.url;
    }

    const video = adaptive_formats.find(checkRender);
    if (!match && video) {
        match = video;
        type = "render";
        urls = [video.url, audio.url];
    }

    if (match) {
        filenameAttributes.qualityLabel = match.quality_label;
        filenameAttributes.resolution = `${match.width}x${match.height}`;
        filenameAttributes.extension = c[o.format].container;
        filenameAttributes.youtubeFormat = o.format;
        return {
            type,
            urls,
            filenameAttributes, 
            fileMetadata
        }
    }

    return { error: 'ErrorYTTryOtherCodec' }
}
