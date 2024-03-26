import { genericUserAgent } from "../../config.js";

const headers = {
    'User-Agent': genericUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
}

async function resolveUrl(url) {
    return fetch(url, { headers })
        .then(r => {
            if (r.headers.get('location')) {
                return decodeURIComponent(r.headers.get('location'))
            }
            if (r.headers.get('link')) {
                const linkMatch = r.headers.get('link').match(/<(.*?)\/>/)
                return decodeURIComponent(linkMatch[1])
            }
            return false
        })
        .catch(() => false)
}

export default async function ({ shortLink, username, id }) {
    const isShortLink = !!shortLink?.length

    let url = isShortLink
        ? `https://fb.watch/${shortLink}`
        : `https://web.facebook.com/${username}/videos/${id}`

    if (isShortLink) {
        url = await resolveUrl(url)
    }

    const html = await fetch(url, { headers })
        .then(r => r.text())
        .catch(() => false)

    if (!html) return { error: 'ErrorCouldntFetch' };

    const urls = []
    const hd = html.match('"browser_native_hd_url":"(.*?)"')
    const sd = html.match('"browser_native_sd_url":"(.*?)"')

    if (hd?.length) {
        urls.push(JSON.parse(`["${hd[1]}"]`)[0])
    }
    if (sd?.length) {
        urls.push(JSON.parse(`["${sd[1]}"]`)[0])
    }

    if (!urls.length) {
        return { error: 'ErrorEmptyDownload' };
    }

    let filename = `facebook_${id}.mp4`
    if (isShortLink) {
        filename = `facebook_${shortLink}.mp4`
    } else if (username?.length && username !== 'user') {
        filename = `facebook_${username}_${id}.mp4`
    }

    return {
        urls: urls[0],
        filename,
        audioFilename: `${filename.slice(0, -4)}_audio`,
    };
}