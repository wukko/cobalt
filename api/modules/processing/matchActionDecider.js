import { audioIgnore, services, supportedAudio } from "../config.js";
import { apiJSON } from "../sub/utils.js";
import loc from "../../localization/manager.js";
import createFilename from "./createFilename.js";

export default function(r, host, userFormat, isAudioOnly, lang, isAudioMuted, disableMetadata, filenamePattern, toGif) {
    let action,
        responseType = 2,
        defaultParams = {
            u: r.urls,
            service: host,
            filename: r.filenameAttributes ?
                    createFilename(r.filenameAttributes, filenamePattern, isAudioOnly, isAudioMuted) : r.filename,
            fileMetadata: !disableMetadata ? r.fileMetadata : false
        },
        params = {},
        audioFormat = String(userFormat);

    if (r.isPhoto) action = "photo";
    else if (r.picker) action = "picker"
    else if (r.isGif && toGif) action = "gif";
    else if (isAudioMuted) action = "muteVideo";
    else if (isAudioOnly) action = "audio";
    else if (r.isM3U8) action = "singleM3U8";
    else action = "video";

    if (action === "picker" || action === "audio") {
        if (!r.filenameAttributes) defaultParams.filename = r.audioFilename;
        defaultParams.isAudioOnly = true;
        defaultParams.audioFormat = audioFormat;
    }
    if (isAudioMuted && !r.filenameAttributes) {
        defaultParams.filename = r.filename.replace('.', '_mute.')
    }

    switch (action) {
        default:
            return apiJSON(0, { t: loc(lang, 'ErrorEmptyDownload') });

        case "photo":
            responseType = 1;
            break;
        
        case "gif":
            params = { type: "gif" }
            break;

        case "singleM3U8":
            params = { type: "remux" }
            break;

        case "muteVideo":
            params = {
                type: Array.isArray(r.urls) ? "bridge" : "mute",
                u: Array.isArray(r.urls) ? r.urls[0] : r.urls,
                mute: true
            }
            if (host === "reddit" && r.typeId === 1) responseType = 1;
            break;

        case "picker":
            responseType = 5;
            switch (host) {
                case "instagram":
                case "twitter":
                    params = { picker: r.picker };
                    break;
                case "douyin":
                case "tiktok":
                    let pickerType = "render";
                    if (audioFormat === "mp3" || audioFormat === "best") {
                        audioFormat = "mp3";
                        pickerType = "bridge"
                    }
                    params = {
                        type: pickerType,
                        picker: r.picker,
                        u: Array.isArray(r.urls) ? r.urls[1] : r.urls,
                        copy: audioFormat === "best" ? true : false
                    }
            }
            break;

        case "video":
            switch (host) {
                case "bilibili":
                    params = { type: "render" };
                    break;
                case "youtube":
                    params = { type: r.type };
                    break;
                case "reddit":
                    responseType = r.typeId;
                    params = { type: r.type };
                    break;
                case "vimeo":
                    if (Array.isArray(r.urls)) {
                        params = { type: "render" }
                    } else {
                        responseType = 1;
                    }
                    break;
                
                case "twitter":
                    if (r.type === "remux") {
                        params = { type: r.type };
                    } else {
                        responseType = 1;
                    }
                    break;

                case "vk":
                case "douyin":
                case "tiktok":
                    params = { type: "bridge" };
                    break;

                case "vine":
                case "instagram":
                case "tumblr":
                case "pinterest":
                case "streamable":
                    responseType = 1;
                    break;
            }
            break;

        case "audio": 
            if ((host === "reddit" && r.typeId === 1) || audioIgnore.includes(host)) {
                return apiJSON(0, { t: loc(lang, 'ErrorEmptyDownload') })
            }

            let processType = "render",
                copy = false;
            
            if (!supportedAudio.includes(audioFormat)) {
                audioFormat = "best"
            }

            const isBestAudio = audioFormat === "best";
            const isBestOrMp3 = audioFormat === "mp3" || isBestAudio;
            const isBestAudioDefined = isBestAudio && services[host]["bestAudio"];
            const isBestHostAudio = services[host]["bestAudio"] && (audioFormat === services[host]["bestAudio"]);

            const isTikTok = host === "tiktok" || host === "douyin";
            const isTumblrAudio = host === "tumblr" && !r.filename;
            const isSoundCloud = host === "soundcloud";

            if (isTikTok && services.tiktok.audioFormats.includes(audioFormat)) {
                if (r.isMp3 && isBestOrMp3) {
                    audioFormat = "mp3";
                    processType = "bridge"
                } else if (isBestAudio) {
                    audioFormat = "m4a";
                    processType = "bridge"
                }
            }

            if (isSoundCloud && services.soundcloud.audioFormats.includes(audioFormat)) {
                if (r.isMp3 && isBestOrMp3) {
                    audioFormat = "mp3";
                    processType = "render"
                    copy = true
                } else if (isBestAudio || audioFormat === "opus") {
                    audioFormat = "opus";
                    processType = "render"
                    copy = true
                }
            }

            if (isBestAudioDefined || isBestHostAudio) {
                audioFormat = services[host]["bestAudio"];
                processType = "bridge";
            } else if (isBestAudio && !isSoundCloud) {
                audioFormat = "m4a";
                copy = true
            }

            if (isTumblrAudio && isBestOrMp3) {
                audioFormat = "mp3";
                processType = "bridge"
            }

            if (r.isM3U8 || host === "vimeo") {
                copy = false;
                processType = "render"
            }

            params = {
                type: processType,
                u: Array.isArray(r.urls) ? r.urls[1] : r.urls,
                audioFormat: audioFormat,
                copy: copy
            }
            break;
    }

    return apiJSON(responseType, {...defaultParams, ...params})
}
