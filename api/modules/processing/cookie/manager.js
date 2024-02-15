import Cookie from './cookie.js';
import { readFile, writeFile } from 'fs/promises';
import { parse as parseSetCookie, splitCookiesString } from 'set-cookie-parser';

const WRITE_INTERVAL = 60000,
      cookiePath = process.env.COOKIE_PATH,
      COUNTER = Symbol('counter');

let cookies = {}, dirty = false, intervalId;

const setup = async () => {
    try {
        if (!cookiePath) return;

        cookies = await readFile(cookiePath, 'utf8');
        cookies = JSON.parse(cookies);
        intervalId = setInterval(writeChanges, WRITE_INTERVAL)
    } catch { /* no cookies for you */ }
}

setup();

function writeChanges() {
    if (!dirty) return;
    dirty = false;

    writeFile(cookiePath, JSON.stringify(cookies, null, 4)).catch(() => {
        clearInterval(intervalId)
    })
}

export function getCookie(service) {
    if (!cookies[service] || !cookies[service].length) return;

    let n;
    if (cookies[service][COUNTER] === undefined) {
        n = cookies[service][COUNTER] = 0
    } else {
        ++cookies[service][COUNTER]
        n = (cookies[service][COUNTER] %= cookies[service].length)
    }

    const cookie = cookies[service][n];
    if (typeof cookie === 'string') cookies[service][n] = Cookie.fromString(cookie);

    return cookies[service][n]
}

export function updateCookie(cookie, headers) {
    if (!cookie) return;

    const parsed = parseSetCookie(
        splitCookiesString(headers.get('set-cookie')),
        { decodeValues: false }
    ), values = {}

    cookie.unset(parsed.filter(c => c.expires < new Date()).map(c => c.name));
    parsed.filter(c => !c.expires || c.expires > new Date()).forEach(c => values[c.name] = c.value);
    updateCookieValues(cookie, values);
}

export function updateCookieValues(cookie, values) {
    cookie.set(values);
    if (Object.keys(values).length) dirty = true
}
