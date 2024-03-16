import psl from "psl";
import { genericUserAgent } from "../../../core/config.js";

const API_KEY = 'jrsCWX1XDuVxAFO4GkK147syAoN8BJZ5voz8tS80bPcj26Vc5Z';
const API_BASE = 'https://api-http2.tumblr.com';

function request(domain, id) {
    const url = new URL(`/v2/blog/${domain}/posts/${id}/permalink`, API_BASE);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('fields[blogs]', 'uuid,name,avatar,?description,?can_message,?can_be_followed,?is_adult,?reply_conditions,'
                                            + '?theme,?title,?url,?is_blocked_from_primary,?placement_id,?primary,?updated,?followed,'
                                            + '?ask,?can_subscribe,?paywall_access,?subscription_plan,?is_blogless_advertiser,?tumblrmart_accessories');

    return fetch(url, {
        headers: {
            'User-Agent': 'Tumblr/iPhone/33.3/333010/17.3.1/tumblr',
            'X-Version': 'iPhone/33.3/333010/17.3.1/tumblr'
        }
    }).then(a => a.json()).catch(() => {});
}

export default async function(input) {
    let { subdomain } = psl.parse(input.url.hostname);

    if (subdomain?.includes('.')) {
        return { error: ['ErrorBrokenLink', 'tumblr'] }
    } else if (subdomain === 'www' || subdomain === 'at') {
        subdomain = undefined
    }

    const domain = `${subdomain ?? input.user}.tumblr.com`;
    const data = await request(domain, input.id);

    const element = data?.response?.timeline?.elements?.[0];
    if (!element) return { error: 'ErrorEmptyDownload' };

    const contents = [
        ...element.content,
        ...element?.trail?.map(t => t.content).flat()
    ]

    const audio = contents.find(c => c.type === 'audio');
    if (audio && audio.provider === 'tumblr') {
        const fileMetadata = {
            title: audio?.title,
            artist: audio?.artist
        };

        return {
            urls: audio.media.url,
            filenameAttributes: {
                service: 'tumblr',
                id: input.id,
                title: fileMetadata.title,
                author: fileMetadata.artist
            },
            isAudioOnly: true
        }
    }

    const video = contents.find(c => c.type === 'video');
    if (video && video.provider === 'tumblr') {
        return {
            urls: video.media.url,
            filename: `tumblr_${input.id}.mp4`,
            audioFilename: `tumblr_${input.id}_audio`
        }
    }

    return { error: 'ErrorEmptyDownload' }
}
