import { createStream } from "../../stream/manage.js";
import { genericUserAgent } from "../../config.js";
import { getCookie, updateCookie } from "../cookie/manager.js";

const commonInstagramHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'User-Agent': genericUserAgent,
    'X-Ig-App-Id': '936619743392459',
    'X-Asbd-Id': '129477',
    'x-requested-with': 'XMLHttpRequest',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'upgrade-insecure-requests': '1',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8',
}

async function request(url, cookie) {
    const data = await fetch(url, {
        headers: {
            ...commonInstagramHeaders,
            'x-ig-www-claim': cookie?._wwwClaim || '0',
            'x-csrftoken': cookie?.values()?.csrftoken,
            cookie
        }
    })

    if (data.headers.get('X-Ig-Set-Www-Claim') && cookie)
        cookie._wwwClaim = data.headers.get('X-Ig-Set-Www-Claim');

    updateCookie(cookie, data.headers);
    return data.json();
}

async function getPost(id) {
    let data;
    try {
        const cookie = getCookie('instagram');

        const url = new URL('https://www.instagram.com/graphql/query/');
        url.searchParams.set('query_hash', 'b3055c01b4b222b8a47dc12b090e4e64')
        url.searchParams.set('variables', JSON.stringify({
            child_comment_count: 3,
            fetch_comment_count: 40,
            has_threaded_comments: true,
            parent_comment_count: 24,
            shortcode: id
        }))

        data = (await request(url, cookie)).data;

    } catch {}

    if (!data) return { error: 'ErrorCouldntFetch' };

    const sidecar = data?.shortcode_media?.edge_sidecar_to_children;
    if (sidecar) {
        const picker = sidecar.edges.filter(e => e.node?.display_url)
            .map(e => {
                const type = e.node?.is_video ? "video" : "photo";
                const url = type === "video" ? e.node?.video_url : e.node?.display_url;

                return {
                    type, url,
                    /* thumbnails have `Cross-Origin-Resource-Policy`
                    ** set to `same-origin`, so we need to proxy them */
                    thumb: createStream({
                        service: "instagram",
                        type: "default",
                        u: e.node?.display_url,
                        filename: "image.jpg"
                    })
                }
            });

        if (picker.length) return { picker }
    } else if (data?.shortcode_media?.video_url) {
        return {
            urls: data.shortcode_media.video_url,
            filename: `instagram_${id}.mp4`,
            audioFilename: `instagram_${id}_audio`
        }
    } else if (data?.shortcode_media?.display_url) {
        return {
            urls: data.shortcode_media.display_url,
            isPhoto: true
        }
    }

    return { error: 'ErrorEmptyDownload' }
}

async function usernameToId(username, cookie) {
    const url = new URL('https://www.instagram.com/api/v1/users/web_profile_info/');
        url.searchParams.set('username', username);

    try {
        const data = await request(url, cookie);
        return data?.data?.user?.id;
    } catch {}
}

async function getStory(username, id) {
    const cookie = getCookie('instagram');
    if (!cookie) return { error: 'ErrorUnsupported' }

    const userId = await usernameToId(username, cookie);
    if (!userId) return { error: 'ErrorEmptyDownload' }

    const url = new URL('https://www.instagram.com/api/v1/feed/reels_media/');
          url.searchParams.set('reel_ids', userId);
          url.searchParams.set('media_id', id);

    let media;
    try {
        const data = await request(url, cookie);
        media = data?.reels_media?.find(m => m.id === userId);
    } catch {}

    const item = media.items[media.media_ids.indexOf(id)];
    if (!item) return { error: 'ErrorEmptyDownload' };
    
    if (item.video_versions) {
        const video = item.video_versions.reduce((a, b) => a.width * a.height < b.width * b.height ? b : a)
        return {
            urls: video.url,
            filename: `instagram_${id}.mp4`,
            audioFilename: `instagram_${id}_audio`
        }
    }

    if (item.image_versions2?.candidates) {
        return {
            urls: item.image_versions2.candidates[0].url,
            isPhoto: true
        }
    }

    return { error: 'ErrorCouldntFetch' };
}

export default function(obj) {
    const { postId, storyId, username } = obj;
    if (postId) return getPost(postId);
    if (username && storyId) return getStory(username, storyId);

    return { error: 'ErrorUnsupported' }
}
