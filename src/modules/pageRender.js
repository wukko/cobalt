import { services, appName, authorInfo, version, quality, repo, donations } from "./config.js";
import { getCommitInfo } from "./sub/currentCommit.js";
import loc from "./sub/i18n.js";

let s = services
let enabledServices = Object.keys(s).filter((p) => {
    if (s[p].enabled) {
        return true
    }
}).sort().map((p) => {
    if (s[p].alias) {
        return s[p].alias
    } else {
        return p
    }
}).join(', ')

let donate = ``
for (let i in donations) {
    donate += `<div class="subtitle">${i} (REPLACEME)</div><div id="don-${i}" class="text-to-copy" onClick="copy('don-${i}')">${donations[i]}</div>`
}

let com = getCommitInfo();
export default function(obj) {
    let isIOS = obj.useragent.toLowerCase().match("iphone os")
    try {
        return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=${isIOS ? `1` : `5`}" />

        <title>${appName}</title>

        <meta property="og:url" content="${process.env.selfURL}" />
        <meta property="og:title" content="${appName}" />
        <meta property="og:description" content="${loc(obj.lang, 'strings', 'embed')}" />
        <meta property="og:image" content="${process.env.selfURL}icons/generic.png" />
        <meta name="title" content="${appName}" />
        <meta name="description" content="${loc(obj.lang, 'strings', 'embed')}" />
        <meta name="theme-color" content="#000000" />
        <meta name="twitter:card" content="summary" />

        <link rel="icon" type="image/x-icon" href="icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png" />

        <link rel="manifest" href="cobalt.webmanifest" />
        <link rel="stylesheet" href="dist/${obj.distUUID}/bundle.${obj.hash}.css" />

        <noscript><div style="margin: 2rem;">${loc(obj.lang, 'strings', 'noScript')}</div></noscript>
    </head>
    <body id="cobalt-body">
        <div id="popup-download" class="popup center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('download', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-subtitle">${loc(obj.lang, 'title', 'download')}</div>
            </div>
            <div id="content" class="popup-content">
            <div id="theme-switcher" class="switch-container small-padding">
                <div class="subtitle">${loc(obj.lang, 'title', 'pickDownload')}</div>
                <div class="switches">
                    <a id="pd-download" class="switch full space-right" target="_blank"">${loc(obj.lang, 'strings', 'download')}</a>
                    <div id="pd-copy" class="switch full">${loc(obj.lang, 'strings', 'copy')}</div>
                </div>
            </div>
                <div id="desc" class="explanation about-padding">${isIOS ? loc(obj.lang, 'strings', 'iosDownload') : loc(obj.lang, 'strings', 'normalDownload')}</div>
            </div>
        </div>
        <div id="popup-about" class="popup center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('about', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'about')}</div>
            </div>
            <div id="content" class="popup-content with-footer">
                <div id="desc" class="popup-desc about-padding">${loc(obj.lang, 'strings', 'aboutSummary')}</div>
                <div id="desc" class="popup-desc about-padding">${loc(obj.lang, 'strings', 'supportedServices')} ${enabledServices}.</div>
                <div id="desc" class="popup-desc"><a class="text-backdrop" href="${repo}">${loc(obj.lang, 'strings', 'sourceCode')}</a></div>
            </div>
            <div id="popup-footer" class="popup-footer">
                <a id="popup-bottom" class="popup-footer-content" href="${authorInfo.link}">${loc(obj.lang, 'strings', 'popupBottom')}</a>
            </div>
        </div>
        <div id="popup-changelog" class="popup center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('changelog', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'changelog')}</div>
                <div id="desc" class="popup-subtitle">${com[0]} (${obj.hash})</div>
            </div>
            <div id="content" class="popup-content">
                <div id="desc" class="popup-desc about-padding">${com[1]}</div>
                <div id="desc" class="popup-desc"><a class="text-backdrop" href="${repo}/commits">${loc(obj.lang, 'strings', 'github')}</a></div>
            </div>
        </div>
        <div id="popup-donate" class="popup scrollable center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('donate', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'donate')}</div>
                <div id="desc" class="little-subtitle">${loc(obj.lang, 'strings', 'donationsSub')}</div>
            </div>
            <div id="content" class="popup-content">
                ${donate.replace(/REPLACEME/g, loc(obj.lang, 'strings', 'clickToCopy').trim())}
                <div id="desc" class="explanation about-padding">${loc(obj.lang, 'strings', 'donations')}</div>
                <div id="desc" class="popup-desc"><a class="text-backdrop" href="${authorInfo.contact}">${loc(obj.lang, 'strings', 'donateDm')}</a></div>
            </div>
        </div>
        <div id="popup-settings" class="popup scrollable center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('settings', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="version" class="popup-above-title">v.${version} ~ ${obj.hash}</div>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'settings')}</div>
            </div>
            <div id="content" class="popup-content">
                <div id="settings-appearance" class="settings-category">
                    <div class="title">${loc(obj.lang, 'settings', 'appearance')}</div>
                    <div class="settings-category-content">
                        <div id="theme-switcher" class="switch-container">
                            <div class="subtitle">${loc(obj.lang, 'settings', 'theme')}</div>
                            <div class="switches">
                                <div id="theme-auto" class="switch full" onclick="changeSwitcher('theme', 'auto', 1)">${loc(obj.lang, 'settings', 'themeAuto')}</div>
                                <div id="theme-dark" class="switch" onclick="changeSwitcher('theme', 'dark', 1)">${loc(obj.lang, 'settings', 'themeDark')}</div>
                                <div id="theme-light" class="switch full" onclick="changeSwitcher('theme', 'light', 1)">${loc(obj.lang, 'settings', 'themeLight')}</div>
                            </div>
                        </div>
                        <div class="subtitle">${loc(obj.lang, 'settings', 'misc')}</div>
                        <label class="checkbox"> 
                            <input id="alwaysVisibleButton" type="checkbox" aria-label="${loc(obj.lang, 'accessibility', 'alwaysVisibleButton')}" onclick="checkbox('alwaysVisibleButton', 'always-visible-button')">
                            <span>${loc(obj.lang, 'settings', 'alwaysVisibleButton')}</span>
                        </label>
                    </div>
                </div>
                <div id="settings-downloads" class="settings-category">
                    <div class="title">${loc(obj.lang, 'settings', 'general')}</div>
                    <div class="settings-category-content">
                        <div id="quality-switcher" class="switch-container">
                            <div class="subtitle">${loc(obj.lang, 'settings', 'quality')}</div>
                            <div class="switches">
                                <div id="quality-max" class="switch full" onclick="changeSwitcher('quality', 'max', 1)">${loc(obj.lang, 'settings', 'qmax')}</div>
                                <div id="quality-hig" class="switch" onclick="changeSwitcher('quality', 'hig', 1)">${loc(obj.lang, 'settings', 'qhig')}(${quality.hig}p)</div>
                                <div id="quality-mid" class="switch full" onclick="changeSwitcher('quality', 'mid', 1)">${loc(obj.lang, 'settings', 'qmid')}(${quality.mid}p)</div>
                                <div id="quality-low" class="switch right" onclick="changeSwitcher('quality', 'low', 1)">${loc(obj.lang, 'settings', 'qlow')}(${quality.low}p)</div>
                            </div>
                            <div class="explanation">${loc(obj.lang, 'settings', 'qualityDesc')}</div>
                        </div>
                        ${!isIOS ? `<div class="subtitle">${loc(obj.lang, 'settings', 'extra')}</div>
                        <label class="checkbox"> 
                            <input id="downloadPopup" type="checkbox" aria-label="${loc(obj.lang, 'accessibility', 'downloadPopup')}" onclick="checkbox('downloadPopup', 'always-visible-button')">
                            <span>${loc(obj.lang, 'settings', 'downloadPopupButton')}</span>
                        </label>` : ``}
                    </div>
                </div>
                <div id="settings-youtube" class="settings-category">
                    <div class="title">youtube</div>
                    <div class="settings-category-content">
                        <div id="youtube-switcher" class="switch-container">
                            <div class="subtitle">${loc(obj.lang, 'settings', 'format')}</div>
                            <div class="switches">
                                <div id="youtubeFormat-mp4" class="switch full" onclick="changeSwitcher('youtubeFormat', 'mp4', 1)">mp4</div>
                                <div id="youtubeFormat-webm" class="switch" onclick="changeSwitcher('youtubeFormat', 'webm', 1)">webm</div>
                                <div id="youtubeFormat-audio" class="switch full" onclick="changeSwitcher('youtubeFormat', 'audio', 1)">${loc(obj.lang, 'settings', 'audioOnly')}</div>
                            </div>
                            <div class="explanation">${loc(obj.lang, 'settings', 'formatInfo')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="popup-error" class="popup center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('error', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'error')}</div>
            </div>
            <div id="content" class="popup-content">
                <div id="desc-error" class="popup-desc"></div>
            </div>
        </div>
        <div id="popup-backdrop" style="visibility: hidden;"></div>
        <div id="cobalt-main-box" class="center box" style="visibility: hidden;">
            <div id="logo-area">${appName}</div>
            <div id="download-area" class="mobile-center">
                <input id="url-input-area" class="mono" type="text" autocorrect="off" maxlength="110" autocapitalize="off" placeholder="${loc(obj.lang, 'strings', 'input')}" aria-label="${loc(obj.lang, 'accessibility', 'input')}" oninput="button()">
                <input id="download-button" class="mono dontRead" onclick="download(document.getElementById('url-input-area').value)" type="submit" value="" disabled=true aria-label="${loc(obj.lang, 'accessibility', 'download')}">
            </div>
        </div>
        <footer id="footer" style="visibility: hidden;">
            <div id="footer-buttons">
            <button id="about-open" class="button footer-button" onclick="popup('about', 1)" aria-label="${loc(obj.lang, 'accessibility', 'about')}">?</button>
                <button id="changelog-open" class="button footer-button" onclick="popup('changelog', 1)" aria-label="${loc(obj.lang, 'accessibility', 'changelog')}">!</button>
                <button id="donate-open" class="button footer-button" onclick="popup('donate', 1)" aria-label="${loc(obj.lang, 'accessibility', 'donate')}">$</button>
                <button id="settings-open" class="button footer-button" onclick="popup('settings', 1)" aria-label="${loc(obj.lang, 'accessibility', 'settings')}">+</button>
            </div>
        </footer>
    </body>
    <script type="text/javascript">const loc = {noInternet:"${loc(obj.lang, 'apiError', 'noInternet')}"}</script>
    <script type="text/javascript" src="dist/${obj.distUUID}/bundle.${obj.hash}.js"></script>
</html>`;
    } catch (err) {
        return `${loc('en', 'apiError', 'noRender', obj.hash)}`;
    }
}