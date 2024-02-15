import { normalizeURL } from "../processing/url.js";
import { createStream } from "../stream/manage.js";
import ipaddr from "ipaddr.js";

const apiVar = {
    allowed: {
        vCodec: ["h264", "av1", "vp9"],
        vQuality: ["max", "4320", "2160", "1440", "1080", "720", "480", "360", "240", "144"],
        aFormat: ["best", "mp3", "ogg", "wav", "opus"],
        filenamePattern: ["classic", "pretty", "basic", "nerdy"]
    },
    booleanOnly: ["isAudioOnly", "isTTFullAudio", "isAudioMuted", "dubLang", "vimeoDash", "disableMetadata", "twitterGif"]
}
const forbiddenCharsString = ['}', '{', '%', '>', '<', '^', ';', '`', '$', '"', "@", '='];

export function apiJSON(type, obj) {
    try {
        switch (type) {
            case 0:
                return { status: 400, body: { status: "error", text: obj.t } };
            case 1:
                return { status: 200, body: { status: "redirect", url: obj.u } };
            case 2:
                return { status: 200, body: { status: "stream", url: createStream(obj) } };
            case 3:
                return { status: 200, body: { status: "success", text: obj.t } };
            case 4:
                return { status: 429, body: { status: "rate-limit", text: obj.t } };
            case 5:
                let pickerType = "various", audio = false
                switch (obj.service) {
                    case "douyin":
                    case "tiktok":
                        audio = obj.u
                        pickerType = "images"
                        break;
                }
                return { status: 200, body: { status: "picker", pickerType: pickerType, picker: obj.picker, audio: audio } };
            case 6: // critical error, action should be taken by balancer/other server software
                return { status: 500, body: { status: "error", text: obj.t, critical: true } };
            default:
                return { status: 400, body: { status: "error", text: "Bad Request" } };
        }
    } catch (e) {
        return { status: 500, body: { status: "error", text: "Internal Server Error", critical: true } };
    }
}
export function metadataManager(obj) {
    let keys = Object.keys(obj);
    let tags = ["album", "composer", "genre", "copyright", "encoded_by", "title", "language", "artist", "album_artist", "performer", "disc", "publisher", "track", "encoder", "compilation", "date", "creation_time", "comment"]
    let commands = []

    for (let i in keys) { if (tags.includes(keys[i])) commands.push('-metadata', `${keys[i]}=${obj[keys[i]]}`) }
    return commands;
}

export function cleanString(string) {
    for (let i in forbiddenCharsString) {
        string = string.replaceAll("/", "_").replaceAll(forbiddenCharsString[i], '')
    }
    return string;
}
export function verifyLanguageCode(code) {
    return RegExp(/[a-z]{2}/).test(String(code.slice(0, 2).toLowerCase())) ? String(code.slice(0, 2).toLowerCase()) : "en"
}
export function languageCode(req) {
    return req.header('Accept-Language') ? verifyLanguageCode(req.header('Accept-Language')) : "en"
}
export function unicodeDecode(str) {
    return str.replace(/\\u[\dA-F]{4}/gi, (unicode) => {
        return String.fromCharCode(parseInt(unicode.replace(/\\u/g, ""), 16));
    });
}
export function checkJSONPost(obj) {
    let def = {
        url: normalizeURL(decodeURIComponent(obj.url)),
        vCodec: "h264",
        vQuality: "720",
        aFormat: "mp3",
        filenamePattern: "classic",
        isAudioOnly: false,
        isTTFullAudio: false,
        isAudioMuted: false,
        disableMetadata: false,
        dubLang: false,
        vimeoDash: false,
        twitterGif: false
    }
    try {
        let objKeys = Object.keys(obj);
        let defKeys = Object.keys(def);
        if (objKeys.length > defKeys.length + 1 || !obj.url) return false;

        for (let i in objKeys) {
            if (String(objKeys[i]) !== "url" && defKeys.includes(objKeys[i])) {
                if (apiVar.booleanOnly.includes(objKeys[i])) {
                    def[objKeys[i]] = obj[objKeys[i]] ? true : false;
                } else {
                    if (apiVar.allowed[objKeys[i]] && apiVar.allowed[objKeys[i]].includes(obj[objKeys[i]])) def[objKeys[i]] = String(obj[objKeys[i]])
                }
            }
        }

        if (def.dubLang)
            def.dubLang = verifyLanguageCode(obj.dubLang);

        return def
    } catch (e) {
        return false
    }
}
export function getIP(req) {
    const strippedIP = req.ip.replace(/^::ffff:/, '');
    const ip = ipaddr.parse(strippedIP);
    if (ip.kind() === 'ipv4') {
        return strippedIP;
    }

    const prefix = 56;
    const v6Bytes = ip.toByteArray();
          v6Bytes.fill(0, prefix / 8);

    return ipaddr.fromByteArray(v6Bytes).toString();
}
export function cleanHTML(html) {
    let clean = html.replace(/ {4}/g, '');
    clean = clean.replace(/\n/g, '');
    return clean
}
