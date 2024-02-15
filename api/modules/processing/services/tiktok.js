import { genericUserAgent } from "../../config.js";

const userAgent = genericUserAgent.split(' Chrome/1')[0],
    config = {
    tiktok: {
        short: "https://vt.tiktok.com/",
        api: "https://api22-normal-c-useast2a.tiktokv.com/aweme/v1/feed/?aweme_id={postId}&version_code=262&app_name=musical_ly&channel=App&device_id=null&os_version=14.4.2&device_platform=iphone&device_type=iPhone9&region=US&carrier_region=US",
        userAgent: "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"
    },
    douyin: {
        short: "https://v.douyin.com/",
        api: "https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id={postId}",
        userAgent: "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"
    }
}

function selector(j, h, id) {
    if (!j) return false;
    let t;
    switch (h) {
        case "tiktok":
            t = j.aweme_list.filter(v => v.aweme_id === id)[0];
            break;
        case "douyin":
            t = j.aweme_detail;
            break;
    }
    if (t?.length < 3) return false;
    return t;
}

export default async function(obj) {
    let postId = obj.postId ? obj.postId : false;

    if (!postId) {
        let html = await fetch(`${config[obj.host].short}${obj.id}`, {
            redirect: "manual",
            headers: { "user-agent": userAgent }
        }).then((r) => { return r.text() }).catch(() => { return false });

        if (!html) return { error: 'ErrorCouldntFetch' };

        if (html.slice(0, 17) === '<a href="https://') {
            postId = html.split('<a href="https://')[1].split('?')[0].split('/')[3]
        } else if (html.slice(0, 32) === '<a href="https://m.tiktok.com/v/' && html.includes('/v/')) {
            postId = html.split('/v/')[1].split('.html')[0].replace("/", '')
        }
    }
    if (!postId) return { error: 'ErrorCantGetID' };

    let detail;
    detail = await fetch(config[obj.host].api.replace("{postId}", postId), {
        headers: {
            "user-agent": config[obj.host].userAgent
        }
    }).then((r) => { return r.json() }).catch(() => { return false });

    detail = selector(detail, obj.host, postId);
    if (!detail) return { error: 'ErrorCouldntFetch' };

    let video, videoFilename, audioFilename, isMp3, audio, images,
        filenameBase = `${obj.host}_${detail.author.unique_id}_${postId}`;

    if (obj.host === "tiktok") {
        images = detail.image_post_info ? detail.image_post_info.images : false
    } else {
        images = detail.images ? detail.images : false
    }

    if (!obj.isAudioOnly && !images) {
        video = detail.video.play_addr.url_list[0];
        videoFilename = `${filenameBase}.mp4`;
    } else {
        let fallback = detail.video.play_addr.url_list[0];
        audio = fallback;
        audioFilename = `${filenameBase}_audio_fv`;  // fv - from video
        if (obj.fullAudio || fallback.includes("music")) {
            audio = detail.music.play_url.url_list[0]
            audioFilename = `${filenameBase}_audio`
        }
        if (audio.slice(-4) === ".mp3") isMp3 = true;
    }

    if (video) return {
        urls: video,
        filename: videoFilename
    }
    if (images && obj.isAudioOnly) return {
        urls: audio,
        audioFilename: audioFilename,
        isAudioOnly: true,
        isMp3: isMp3
    }
    if (images) {
        let imageLinks = [];
        for (let i in images) {
            let sel = obj.host === "tiktok" ? images[i].display_image.url_list : images[i].url_list;
            sel = sel.filter(p => p.includes(".jpeg?"))
            imageLinks.push({url: sel[0]})
        }
        return {
            picker: imageLinks,
            urls: audio,
            audioFilename: audioFilename,
            isAudioOnly: true,
            isMp3: isMp3
        }
    }
    if (audio) return {
        urls: audio,
        audioFilename: audioFilename,
        isAudioOnly: true,
        isMp3: isMp3
    }
}
