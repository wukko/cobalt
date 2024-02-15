import { services } from "./config.js";

import { apiJSON } from "./sub/utils.js";
import { errorUnsupported } from "./sub/errors.js";
import loc from "../localization/manager.js";
import match from "./processing/match.js";
import { getHostIfValid } from "./processing/url.js";

export async function getJSON(url, lang, obj) {
    try {
        const host = getHostIfValid(url);

        if (!host || !services[host].enabled) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }

        let patternMatch;
        for (const pattern of services[host].patterns) {
            patternMatch = pattern.match(
                url.pathname.substring(1) + url.search
            );
            if (patternMatch) break;
        }

        if (!patternMatch) {
            return apiJSON(0, { t: errorUnsupported(lang) });
        }

        return await match(host, patternMatch, url, lang, obj)
    } catch (e) {
        return apiJSON(0, { t: loc(lang, 'ErrorSomethingWentWrong') })
    }
}
