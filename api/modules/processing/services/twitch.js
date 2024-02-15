import { maxVideoDuration } from "../../config.js";
import { cleanString } from '../../sub/utils.js';

const gqlURL = "https://gql.twitch.tv/gql";
const clientIdHead = { "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko" };

export default async function (obj) {
    let req_metadata = await fetch(gqlURL, {
        method: "POST",
        headers: clientIdHead,
        body: JSON.stringify({
            query: `{
            clip(slug: "${obj.clipId}") {
                broadcaster {
                    login
                }
                createdAt
                curator {
                    login
                }
                durationSeconds
                id
                medium: thumbnailURL(width: 480, height: 272)
                title
                videoQualities {
                    quality
                    sourceURL
                }
            }
        }`
        })
    }).then((r) => { return r.status === 200 ? r.json() : false; }).catch(() => { return false });
    if (!req_metadata) return { error: 'ErrorCouldntFetch' };

    let clipMetadata = req_metadata.data.clip;

    if (clipMetadata.durationSeconds > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    if (!clipMetadata.videoQualities || !clipMetadata.broadcaster) return { error: 'ErrorEmptyDownload' };

    let req_token = await fetch(gqlURL, {
        method: "POST",
        headers: clientIdHead,
        body: JSON.stringify([
            {
                "operationName": "VideoAccessToken_Clip",
                "variables": {
                    "slug": obj.clipId
                },
                "extensions": {
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11"
                    }
                }
            }
        ])
    }).then((r) => { return r.status === 200 ? r.json() : false; }).catch(() => { return false });

    if (!req_token) return { error: 'ErrorCouldntFetch' };

    let formats = clipMetadata.videoQualities;
    let format = formats.find(f => f.quality === obj.quality) || formats[0];

    return {
        type: "bridge",
        urls: `${format.sourceURL}?${new URLSearchParams({
            sig: req_token[0].data.clip.playbackAccessToken.signature,
            token: req_token[0].data.clip.playbackAccessToken.value
        })}`,
        fileMetadata: {
            title: cleanString(clipMetadata.title.trim()),
            artist: `Twitch Clip by @${clipMetadata.broadcaster.login}, clipped by @${clipMetadata.curator.login}`,
        },
        filenameAttributes: {
            service: "twitch",
            id: clipMetadata.id,
            title: cleanString(clipMetadata.title.trim()),
            author: `${clipMetadata.broadcaster.login}, clipped by ${clipMetadata.curator.login}`,
            qualityLabel: `${format.quality}p`,
            extension: 'mp4'
        },
        filename: `twitchclip_${clipMetadata.id}_${format.quality}p.mp4`,
        audioFilename: `twitchclip_${clipMetadata.id}_audio`
    }
}
