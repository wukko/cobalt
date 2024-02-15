import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";

const graphqlURL = 'https://twitter.com/i/api/graphql/5GOHgZe-8U2j5sVHQzEm9A/TweetResultByRestId';
const tokenURL = 'https://api.twitter.com/1.1/guest/activate.json';

const tweetFeatures = JSON.stringify({ "creator_subscriptions_tweet_preview_api_enabled": true, "c9s_tweet_anatomy_moderator_badge_enabled": true, "tweetypie_unmention_optimization_enabled": true, "responsive_web_edit_tweet_api_enabled": true, "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true, "view_counts_everywhere_api_enabled": true, "longform_notetweets_consumption_enabled": true, "responsive_web_twitter_article_tweet_consumption_enabled": false, "tweet_awards_web_tipping_enabled": false, "responsive_web_home_pinned_timelines_enabled": true, "freedom_of_speech_not_reach_fetch_enabled": true, "standardized_nudges_misinfo": true, "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true, "longform_notetweets_rich_text_read_enabled": true, "longform_notetweets_inline_media_enabled": true, "responsive_web_graphql_exclude_directive_enabled": true, "verified_phone_label_enabled": false, "responsive_web_media_download_video_enabled": false, "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false, "responsive_web_graphql_timeline_navigation_enabled": true, "responsive_web_enhance_cards_enabled": false });

const commonHeaders = {
    "user-agent": genericUserAgent,
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    "x-twitter-client-language": "en",
    "x-twitter-active-user": "yes",
    "accept-language": "en"
}

// fix all videos affected by the container bug in twitter muxer (took them over two weeks to fix it????)
const TWITTER_EPOCH = 1288834974657n;
const badContainerStart = new Date(1701446400000);
const badContainerEnd = new Date(1702605600000);

function needsFixing(media) {
    const representativeId = media.source_status_id_str ?? media.id_str;
    const mediaTimestamp = new Date(
        Number((BigInt(representativeId) >> 22n) + TWITTER_EPOCH)
    );
    return mediaTimestamp > badContainerStart && mediaTimestamp < badContainerEnd
}

function bestQuality(arr) {
    return arr.filter(v => v.content_type === "video/mp4")
        .reduce((a, b) => Number(a?.bitrate) > Number(b?.bitrate) ? a : b)
        .url
}

let _cachedToken;
const getGuestToken = async (forceReload = false) => {
    if (_cachedToken && !forceReload) {
        return _cachedToken;
    }

    const tokenResponse = await fetch(tokenURL, {
        method: 'POST',
        headers: commonHeaders
    }).then(r => r.status === 200 && r.json()).catch(() => {})

    if (tokenResponse?.guest_token) {
        return _cachedToken = tokenResponse.guest_token
    }
}

const requestTweet = (tweetId, token) => {
    const graphqlTweetURL = new URL(graphqlURL);

    graphqlTweetURL.searchParams.set('variables',
        JSON.stringify({
            tweetId,
            withCommunity: false,
            includePromotedContent: false,
            withVoice: false
        })
    );
    graphqlTweetURL.searchParams.set('features', tweetFeatures);

    return fetch(graphqlTweetURL, {
        headers: {
            ...commonHeaders,
            'content-type': 'application/json',
            'x-guest-token': token,
            cookie: `guest_id=${encodeURIComponent(`v1:${token}`)}`
        }
    })
}

export default async function({ id, index, toGif }) {
    let guestToken = await getGuestToken();
    if (!guestToken) return { error: 'ErrorCouldntFetch' };

    let tweet = await requestTweet(id, guestToken);

    if ([403, 429].includes(tweet.status)) { // get new token & retry
        guestToken = await getGuestToken(true);
        tweet = await requestTweet(id, guestToken)
    }

    tweet = await tweet.json();

    // {"data":{"tweetResult":{"result":{"__typename":"TweetUnavailable","reason":"Protected"}}}}
    const tweetTypename = tweet?.data?.tweetResult?.result?.__typename;

    if (tweetTypename === "TweetUnavailable") {
        const reason = tweet?.data?.tweetResult?.result?.reason;
        switch(reason) {
            case "Protected":
                return { error: 'ErrorTweetProtected' }
            case "NsfwLoggedOut":
                return { error: 'ErrorTweetNSFW' }
        }
    }
    if (tweetTypename !== "Tweet") {
        return { error: 'ErrorTweetUnavailable' }
    }

    const baseTweet = tweet.data.tweetResult.result.legacy,
          repostedTweet = baseTweet.retweeted_status_result?.result.legacy.extended_entities;

    let media = (repostedTweet?.media || baseTweet?.extended_entities?.media);
    media = media?.filter(m => m.video_info?.variants?.length);

    // check if there's a video at given index (/video/<index>)
    if ([0, 1, 2, 3].includes(index) && index < media?.length) {
        media = [media[index]]
    }

    switch (media?.length) {
        case undefined:
        case 0:
            return { error: 'ErrorNoVideosInTweet' };
        case 1:
            return {
                type: needsFixing(media[0]) ? "remux" : "normal",
                urls: bestQuality(media[0].video_info.variants),
                filename: `twitter_${id}.mp4`,
                audioFilename: `twitter_${id}_audio`,
                isGif: media[0].type === "animated_gif"
            };
        default:
            const picker = media.map((content, i) => {
                let url = bestQuality(content.video_info.variants);
                const shouldRenderGif = content.type === 'animated_gif' && toGif;

                if (needsFixing(content) || shouldRenderGif) {
                    url = createStream({
                        service: 'twitter',
                        type: shouldRenderGif ? 'gif' : 'remux',
                        u: url,
                        filename: `twitter_${id}_${i + 1}.mp4`
                    })
                }

                return {
                    type: 'video',
                    url,
                    thumb: content.media_url_https,
                }
            });
            return { picker };
    }
}
