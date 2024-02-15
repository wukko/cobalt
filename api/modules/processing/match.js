import { strict as assert } from "node:assert";

import { apiJSON } from "../sub/utils.js";
import { errorUnsupported, genericError, brokenLink } from "../sub/errors.js";

import loc from "../../localization/manager.js";

import { testers } from "./servicesPatternTesters.js";
import matchActionDecider from "./matchActionDecider.js";

import bilibili from "./services/bilibili.js";
import reddit from "./services/reddit.js";
import twitter from "./services/twitter.js";
import youtube from "./services/youtube.js";
import vk from "./services/vk.js";
import ok from "./services/ok.js";
import tiktok from "./services/tiktok.js";
import tumblr from "./services/tumblr.js";
import vimeo from "./services/vimeo.js";
import soundcloud from "./services/soundcloud.js";
import instagram from "./services/instagram.js";
import vine from "./services/vine.js";
import pinterest from "./services/pinterest.js";
import streamable from "./services/streamable.js";
import twitch from "./services/twitch.js";
import rutube from "./services/rutube.js";
import dailymotion from "./services/dailymotion.js";

export default async function(host, patternMatch, url, lang, obj) {
    assert(url instanceof URL);

    try {
        let r, isAudioOnly = !!obj.isAudioOnly, disableMetadata = !!obj.disableMetadata;

        if (!testers[host]) return apiJSON(0, { t: errorUnsupported(lang) });
        if (!(testers[host](patternMatch))) return apiJSON(0, { t: brokenLink(lang, host) });

        switch (host) {
            case "twitter":
                r = await twitter({
                    id: patternMatch.id,
                    index: patternMatch.index - 1,
                    toGif: !!obj.twitterGif
                });
                break;
            case "vk":
                r = await vk({
                    userId: patternMatch.userId,
                    videoId: patternMatch.videoId,
                    quality: obj.vQuality
                });
                break;
            case "ok":
                r = await ok({
                    id: patternMatch.id,
                    quality: obj.vQuality
                });
                break;
            case "bilibili":
                r = await bilibili(patternMatch);
                break;
            case "youtube":
                let fetchInfo = {
                    id: patternMatch.id.slice(0, 11),
                    quality: obj.vQuality,
                    format: obj.vCodec,
                    isAudioOnly: isAudioOnly,
                    isAudioMuted: obj.isAudioMuted,
                    dubLang: obj.dubLang
                }

                if (url.hostname === 'music.youtube.com' || isAudioOnly === true) {
                    fetchInfo.quality = "max";
                    fetchInfo.format = "vp9";
                    fetchInfo.isAudioOnly = true
                }

                r = await youtube(fetchInfo);
                break;
            case "reddit":
                r = await reddit({
                    sub: patternMatch.sub,
                    id: patternMatch.id
                });
                break;
            case "douyin":
            case "tiktok":
                r = await tiktok({
                    host: host,
                    postId: patternMatch.postId,
                    id: patternMatch.id,
                    fullAudio: obj.isTTFullAudio,
                    isAudioOnly: isAudioOnly
                });
                break;
            case "tumblr":
                r = await tumblr({
                    id: patternMatch.id,
                    user: patternMatch.user,
                    url
                });
                break;
            case "vimeo":
                r = await vimeo({
                    id: patternMatch.id.slice(0, 11),
                    password: patternMatch.password,
                    quality: obj.vQuality,
                    isAudioOnly: isAudioOnly,
                    forceDash: isAudioOnly ? true : obj.vimeoDash
                });
                break;
            case "soundcloud":
                isAudioOnly = true;
                r = await soundcloud({
                    url,
                    author: patternMatch.author,
                    song: patternMatch.song,
                    shortLink: patternMatch.shortLink || false,
                    accessKey: patternMatch.accessKey || false
                });
                break;
            case "instagram":
                r = await instagram({
                    ...patternMatch,
                    quality: obj.vQuality
                })
                break;
            case "vine":
                r = await vine({
                    id: patternMatch.id
                });
                break;
            case "pinterest":
                r = await pinterest({
                    id: patternMatch.id,
                    shortLink: patternMatch.shortLink || false
                });
                break;
            case "streamable":
                r = await streamable({
                    id: patternMatch.id,
                    quality: obj.vQuality,
                    isAudioOnly: isAudioOnly,
                });
                break;
            case "twitch":
                r = await twitch({
                    clipId: patternMatch.clip || false,
                    quality: obj.vQuality,
                    isAudioOnly: obj.isAudioOnly
                });
                break;
            case "rutube":
                r = await rutube({
                    id: patternMatch.id,
                    quality: obj.vQuality,
                    isAudioOnly: isAudioOnly
                });
                break;
            case "dailymotion":
                r = await dailymotion(patternMatch);
                break;
            default:
                return apiJSON(0, { t: errorUnsupported(lang) });
        }

        if (r.isAudioOnly) isAudioOnly = true;
        let isAudioMuted = isAudioOnly ? false : obj.isAudioMuted;

        if (r.error && r.critical)
            return apiJSON(6, { t: loc(lang, r.error) })

        if (r.error)
            return apiJSON(0, {
                t: Array.isArray(r.error)
                    ? loc(lang, r.error[0], r.error[1])
                    : loc(lang, r.error)
            })

        return matchActionDecider(
            r, host, obj.aFormat, isAudioOnly,
            lang, isAudioMuted, disableMetadata,
            obj.filenamePattern, obj.twitterGif
        )
    } catch (e) {
        return apiJSON(0, { t: genericError(lang, host) })
    }
}
