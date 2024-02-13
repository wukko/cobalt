import { services } from "../../core/config.js";
import { strict as assert } from "node:assert";
import psl from "psl";

export function aliasURL(url) {
    assert(url instanceof URL);

    const host = psl.parse(url.hostname);
    const parts = url.pathname.split('/');

    switch (host.sld) {
        case "youtube":
            if (url.pathname.startsWith('/live/') || url.pathname.startsWith('/shorts/')) {
                url.pathname = '/watch';
                // parts := ['', 'live' || 'shorts', id, ...rest]
                url.search = `?v=${encodeURIComponent(parts[2])}`
            }
            break;

        case "youtu":
            if (url.hostname === 'youtu.be' && parts.length >= 2) {
                /* youtu.be urls can be weird, e.g. https://youtu.be/<id>//asdasd// still works
                ** but we only care about the 1st segment of the path */
                url = new URL(`https://youtube.com/watch?v=${
                    encodeURIComponent(parts[1])
                }`)
            }
            break;

        case "pin":
            if (url.hostname === 'pin.it' && parts.length === 2) {
                url = new URL(`https://pinterest.com/url_shortener/${
                    encodeURIComponent(parts[1])
                }`)
            }
            break;

        case "vxtwitter":
        case "fixvx":
        case "x":
            if (services.twitter.altDomains.includes(url.hostname)) {
                url.hostname = 'twitter.com'
            }
            break;

        case "twitch":
            if (url.hostname === 'clips.twitch.tv' && parts.length >= 2) {
                url = new URL(`https://twitch.tv/_/clip/${parts[1]}`);
            }
            break;

        case "bilibili":
            if (host.tld === 'tv') {
                url = new URL(`https://bilibili.com/_tv${url.pathname}`);
            }
            break;
        case "b23":
            if (url.hostname === 'b23.tv' && parts.length === 2) {
                url = new URL(`https://bilibili.com/_shortLink/${parts[1]}`)
            }
            break;

        case "dai":
            if (url.hostname === 'dai.ly' && parts.length === 2) {
                url = new URL(`https://dailymotion.com/video/${parts[1]}`)
            }
    }

    return url
}

export function cleanURL(url) {
    assert(url instanceof URL);
    const host = psl.parse(url.hostname).sld;
    let stripQuery = true;

    if (host === 'pinterest') {
        url.hostname = 'pinterest.com'
    } else if (host === 'vk' && url.pathname.includes('/clip')) {
        if (url.searchParams.get('z'))
            url.search = '?z=' + encodeURIComponent(url.searchParams.get('z'));
        stripQuery = false;
    } else if (host === 'youtube' && url.searchParams.get('v')) {
        url.search = '?v=' + encodeURIComponent(url.searchParams.get('v'));
        stripQuery = false;
    }

    if (stripQuery) {
        url.search = ''
    }

    url.username = url.password = url.port = url.hash = ''

    if (url.pathname.endsWith('/'))
        url.pathname = url.pathname.slice(0, -1);

    return url
}

export function normalizeURL(url) {
    return cleanURL(
        aliasURL(
            new URL(url.replace(/^https\/\//, 'https://'))
        )
    );
}

export function getHostIfValid(url) {
    const host = psl.parse(url.hostname);
    if (host.error) return;

    const service = services[host.sld];
    if (!service) return;
    if ((service.tld ?? 'com') !== host.tld) return;

    const anySubdomainAllowed = service.subdomains === '*';
    const validSubdomain = [null, 'www', ...(service.subdomains ?? [])].includes(host.subdomain);
    if (!validSubdomain && !anySubdomainAllowed) return;

    return host.sld;
}
