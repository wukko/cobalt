import HLSParser from 'hls-parser';
import { maxVideoDuration } from '../../config.js';

let _token;

function getExp(token) {
    return JSON.parse(
        Buffer.from(token.split('.')[1], 'base64')
    ).exp * 1000;
}

const getToken = async () => {
    if (_token && getExp(_token) > new Date().getTime()) {
        return _token;
    }

    const req = await fetch('https://graphql.api.dailymotion.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'User-Agent': 'dailymotion/240213162706 CFNetwork/1492.0.1 Darwin/23.3.0',
            'Authorization': 'Basic MGQyZDgyNjQwOWFmOWU3MmRiNWQ6ODcxNmJmYTVjYmEwMmUwMGJkYTVmYTg1NTliNDIwMzQ3NzIyYWMzYQ=='
        },
        body: 'traffic_segment=&grant_type=client_credentials'
    }).then(r => r.json()).catch(() => {});

    if (req.access_token) {
        return _token = req.access_token;
    }
}

export default async function({ id }) {
    const token = await getToken();
    if (!token) return { error: 'ErrorSomethingWentWrong' };

    const req = await fetch('https://graphql.api.dailymotion.com/',
        {
            method: 'POST',
            headers: {
                'User-Agent': 'dailymotion/240213162706 CFNetwork/1492.0.1 Darwin/23.3.0',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-DM-AppInfo-Version': '7.16.0_240213162706',
                'X-DM-AppInfo-Type': 'iosapp',
                'X-DM-AppInfo-Id': 'com.dailymotion.dailymotion'
            },
            body: JSON.stringify({
                operationName: "Media",
                query: `
                    query Media($xid: String!, $password: String) {
                        media(xid: $xid, password: $password) {
                        __typename
                            ... on Video {
                                xid
                                hlsURL
                                duration
                                title
                                channel {
                                    displayName
                                }
                            }
                        }
                    }
                `,
                variables: { xid: id }
            })
        }
    ).then(r => r.status === 200 && r.json()).catch(() => {});

    const media = req?.data?.media;

    if (media?.__typename !== 'Video' || !media.hlsURL) {
        return { error: 'ErrorEmptyDownload' }
    }

    if (media.duration * 1000 > maxVideoDuration) {
        return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    }

    const manifest = await fetch(media.hlsURL).then(r => r.text()).catch(() => {});
    if (!manifest) return { error: 'ErrorSomethingWentWrong' };

    const bestQuality = HLSParser.parse(manifest).variants
                        .filter(v => v.codecs.includes('avc1'))
                        .reduce((a, b) => a.bandwidth > b.bandwidth ? a : b);
    if (!bestQuality) return { error: 'ErrorEmptyDownload' }

    const fileMetadata = {
        title: media.title,
        artist: media.channel.displayName
    }

    return {
        urls: bestQuality.uri,
        isM3U8: true,
        filenameAttributes: {
            service: 'dailymotion',
            id: media.xid,
            title: fileMetadata.title,
            author: fileMetadata.artist,
            resolution: `${bestQuality.resolution.width}x${bestQuality.resolution.height}`,
            qualityLabel: `${bestQuality.resolution.height}p`,
            extension: 'mp4'
        },
        fileMetadata
    }
}