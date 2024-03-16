import { languageList } from "../../localization/manager.js";

export default function(lang, userAgent) {
    let language = languageList.includes(lang) ? lang : "en";

    let ua = userAgent.toLowerCase();
    let platform = (ua.match("android") || ua.match("iphone os")) ? "mob" : "pc";
    if (platform === "mob" && ua.match("iphone os")) platform = "ios";

    return `/build/${platform}/${language}.html`;
}
