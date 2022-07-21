import { createStream } from "../stream/manage.js";
import { execSync } from "child_process";

export function apiJSON(type, obj) {
    try {
        switch (type) {
            case 0:
                return { status: 400, body: { status: "error", text: obj.t } };
            case 1:
                return { status: 200, body: { status: "redirect", url: obj.u } };
            case 2: 
                return { status: 200, body: { status: "stream", url: createStream(obj) } };
            case 3:
                return { status: 200, body: { status: "success", text: obj.t } };
            case 4:
                return { status: 429, body: { status: "rate-limit", text: obj.t } };
            default:
                return { status: 400, body: { status: "error", text: "Bad Request" } };
        }
    } catch (e) {
        return { status: 500, body: { status: "error", text: "Internal Server Error" } };
    }
}
export function msToTime(d) {
    let milliseconds = parseInt((d % 1000) / 100),
        seconds = parseInt((d / 1000) % 60),
        minutes = parseInt((d / (1000 * 60)) % 60),
        hours = parseInt((d / (1000 * 60 * 60)) % 24),
        r;

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    r = hours + ":" + minutes + ":" + seconds;
    milliseconds ? r += "." + milliseconds : r += "";
    return r;
}
export function cleanURL(url, host) {
    url = url.replace('}', '').replace('{', '').replace(')', '').replace('(', '').replace(' ', '');
    if (url.includes('youtube.com/shorts/')) {
        url = url.split('?')[0].replace('shorts/', 'watch?v=');
    }
    if (host == "youtube") {
        url = url.split('&')[0];
    } else {
        url = url.split('?')[0];
        if (url.substring(url.length - 1) == "/") {
            url = url.substring(0, url.length - 1);
        }
    }
    return url
}
export function deepCopy(object) {
    return JSON.parse(JSON.stringify(object))
}