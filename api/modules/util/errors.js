import loc from "../../localization/manager.js";

export function errorUnsupported(lang) {
    return loc(lang, 'ErrorUnsupported');
}
export function brokenLink(lang, host) {
    return loc(lang, 'ErrorBrokenLink', host);
}
export function genericError(lang, host) {
    return loc(lang, 'ErrorBadFetch', host);
}
