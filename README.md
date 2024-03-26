# cobalt
best way to save what you love: [cobalt.tools](https://cobalt.tools/)  

![cobalt logo with repeated logo (double arrow) pattern background](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/pattern.png "cobalt logo with repeated logo (double arrow) pattern background")  

## what's cobalt?
cobalt is a media downloader that doesn't piss you off. it's fast, friendly, and doesn't have any bullshit that modern web is filled with: ***no ads, trackers, or analytics***.  

paste the link, get the file, move on. it's that simple. just how it should be.

## supported services
this list is not final and keeps expanding over time. if support for a service you want is missing, create an issue (or a pull request 👀).

| service                        | video + audio | only audio | only video | metadata | rich file names |
| :--------                      | :-----------: | :--------: | :--------: | :------: | :-------------: |
| bilibili.com & bilibili.tv     | ✅            | ✅         | ✅         | ➖         | ➖              |
| dailymotion                    | ✅            | ✅         | ✅         | ✅         | ✅              |
| facebook videos                | ✅            | ❌         | ❌         | ➖         | ➖              |
| instagram posts & stories      | ✅            | ✅         | ✅         | ➖         | ➖              |
| instagram reels                | ✅            | ✅         | ✅         | ➖         | ➖              |
| ok video                       | ✅            | ❌         | ❌         | ✅         | ✅              |
| pinterest                      | ✅            | ✅         | ✅         | ➖         | ➖              |
| reddit                         | ✅            | ✅         | ✅         | ❌         | ❌              |
| rutube                         | ✅            | ✅         | ✅         | ✅         | ✅              |
| soundcloud                     | ➖            | ✅         | ➖         | ✅         | ✅              |
| streamable                     | ✅            | ✅         | ✅         | ➖         | ➖              |
| tiktok                         | ✅            | ✅         | ✅         | ❌         | ❌              |
| tumblr                         | ✅            | ✅         | ✅         | ➖         | ➖              |
| twitch clips                   | ✅            | ✅         | ✅         | ✅         | ✅              |
| twitter/x                      | ✅            | ✅         | ✅         | ➖         | ➖              |
| vimeo                          | ✅            | ✅         | ✅         | ✅         | ✅              |
| vine archive                   | ✅            | ✅         | ✅         | ➖         | ➖              |
| vk videos & clips              | ✅            | ❌         | ❌         | ✅         | ✅              |
| youtube videos, shorts & music | ✅            | ✅         | ✅         | ✅         | ✅              |

| emoji   | meaning                 |
| :-----: | :---------------------- |
| ✅      | supported               |
| ➖      | impossible/unreasonable |
| ❌      | not supported           |

### additional notes or features (per service)
| service    | notes or features                                                                                                    |
| :--------  | :-----                                                                                                               |
| facebook   | supports public accessible videos content only.                                                                      |
| instagram  | supports photos, videos, and stories. lets you pick what to save from multi-media posts.                             |
| pinterest  | supports videos and stories.                                                                                         |
| reddit     | supports gifs and videos.                                                                                            |
| soundcloud | supports private links.                                                                                              |
| tiktok     | supports videos with or without watermark, images from slideshow without watermark, and full (original) audios.      |
| twitter/x  | lets you pick what to save from multi-media posts. may not be 100% reliable due to current management.               |
| vimeo      | audio downloads are only available for dash.                                                                         |
| youtube    | supports videos, music, and shorts. 8K, 4K, HDR, VR, and high FPS videos. rich metadata & dubs. h264/av1/vp9 codecs. |

## cobalt api
cobalt has an open api that you can use in projects *for completely free~*. it's easy and straightforward to use, [check out the docs](https://github.com/wukko/cobalt/blob/current/docs/api.md) to learn how to use it. 

you can use the main api instance ([co.wuk.sh](https://co.wuk.sh/)) in your projects.

## how to run your own instance
if you want to run your own instance for whatever purpose, [follow this guide](https://github.com/wukko/cobalt/blob/current/docs/run-an-instance.md).  
it's *highly* recommended to use a docker compose method unless you run for developing/debugging purposes.

## sponsors 
cobalt is sponsored by [royalehosting.net](https://royalehosting.net/), all main instances are currently hosted on their network :)  

## ethics and disclaimer
cobalt is a tool for easing content downloads from internet and takes ***zero liability***. you are responsible for what you download, how you use and distribute that content. please be mindful when using content of others and always credit original creators. fair use and credits benefit everyone.

cobalt is ***NOT*** a piracy tool and cannot be used as such. it can only download free, publicly accessible content. such content can be easily downloaded through any browser's dev tools. pressing one button is easier, so i made a convenient, ad-less tool for such repeated actions.

cobalt is my passion project, update schedule depends solely on my free time, motivation, and mood. don't expect any consistency in update releases.

## cobalt license
cobalt code is licensed under [AGPL-3.0](https://github.com/wukko/cobalt/blob/current/LICENSE).

cobalt branding, mascots, and other related assets included in the repo are ***copyrighted*** and not covered by the AGPL-3.0 license. you ***cannot*** use them under same terms.  

you are allowed to host an ***unmodified*** instance of cobalt with branding, but this ***does not*** give you permission to use it anywhere else, or make derivatives of it in any way.

### notes:
- mascots and other assets are a part of the branding.

- when making an alternative version of the project, please replace or remove all branding (including the name).

- you **must** link the original repo when using any parts of code (such as using separate processing modules in your project) or forking the project.

- if you make a modified version of cobalt, the codebase **must** be published under the same license (according to AGPL-3.0).

## 3rd party licenses
- [Fluent Emoji by Microsoft](https://github.com/microsoft/fluentui-emoji) (used in cobalt) is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) license.  
- [Noto Sans Mono](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/) fonts (used in cobalt) are licensed under the [OFL](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/about) license.  
- many update banners were taken from [tenor.com](https://tenor.com/).  

## acknowledgements
### ffmpeg
cobalt heavily relies on ffmpeg for converting and merging media files. it's an absolutely amazing piece of software offered for anyone for free, yet doesn't receive as much credit as it should.

you can [support ffmpeg here](https://ffmpeg.org/donations.html)!

#### ffmpeg-static
we use [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) to get binaries for ffmpeg depending on the platform.

you can support the developer via various methods listed on their github page! (linked above)

### youtube.js
cobalt relies on [youtube.js](https://github.com/LuanRT/YouTube.js) for interacting with the innertube api, it wouldn't have been possible without it.  

you can support the developer via various methods listed on their github page! (linked above)

### many others
cobalt also depends on:

- [content-disposition-header](https://www.npmjs.com/package/content-disposition-header) to simplify the provision of `content-disposition` headers.
- [cors](https://www.npmjs.com/package/cors) to manage cross-origin resource sharing within expressjs.
- [dotenv](https://www.npmjs.com/package/dotenv) to load environment variables from the `.env` file.
- [esbuild](https://www.npmjs.com/package/esbuild) to minify the frontend files.
- [express](https://www.npmjs.com/package/express) as the backbone of cobalt servers.
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) to rate limit api endpoints.
- [hls-parser](https://www.npmjs.com/package/hls-parser) to parse `m3u8` playlists for certain services.
- [ipaddr.js](https://www.npmjs.com/package/ipaddr.js) to parse ip addresses (for rate limiting).
- [nanoid](https://www.npmjs.com/package/nanoid) to generate unique (temporary) identifiers for each requested stream.
- [node-cache](https://www.npmjs.com/package/node-cache) to cache stream info in server ram for a limited amount of time.
- [psl](https://www.npmjs.com/package/psl) as the domain name parser.
- [set-cookie-parser](https://www.npmjs.com/package/set-cookie-parser) to parse cookies that cobalt receives from certain services.
- [undici](https://www.npmjs.com/package/undici) for making http requests
- [url-pattern](https://www.npmjs.com/package/url-pattern) to match provided links with supported patterns.

...and many other packages that these packages rely on.
