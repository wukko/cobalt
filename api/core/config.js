import UrlPattern from "url-pattern";
import { loadJSON } from "../modules/util/loadFromFs.js";

const config = loadJSON("./src/config.json");
const packageJson = loadJSON("./package.json");
const servicesConfigJson = loadJSON("./src/modules/processing/servicesConfig.json");

Object.values(servicesConfigJson.config).forEach(service => {
    service.patterns = service.patterns.map(
        pattern => new UrlPattern(pattern, {
            segmentValueCharset: UrlPattern.defaultOptions.segmentValueCharset + '@\\.'
        })
    )
})

export const
    services = servicesConfigJson.config,
    audioIgnore = servicesConfigJson.audioIgnore,
    version = packageJson.version,
    streamLifespan = config.streamLifespan,
    maxVideoDuration = config.maxVideoDuration,
    genericUserAgent = config.genericUserAgent,
    repo = packageJson["bugs"]["url"].replace('/issues', ''),
    authorInfo = config.authorInfo,
    donations = config.donations,
    ffmpegArgs = config.ffmpegArgs,
    supportedAudio = config.supportedAudio,
    celebrations = config.celebrations,
    links = config.links,
    sponsors = config.sponsors
