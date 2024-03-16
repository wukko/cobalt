import changelogManager from "../changelog/changelogManager.js"
import { cleanHTML } from "../sub/utils.js";

let cache = {}

export function changelogHistory() { // blockId 0
    if (cache['0']) return cache['0'];
    let history = changelogManager("history");
    let render = ``;
    
    let historyLen = history.length;
    for (let i in history) {
        let separator = (i !== 0 && i !== historyLen) ? '<div class="separator"></div>' : '';

        render += `
        ${separator}${history[i]["banner"] ?
        `<div class="changelog-banner">
            <img class="changelog-img" ` +
                `src="${history[i]["banner"]["url"]}" ` +
                `alt="${history[i]["banner"]["alt"].replaceAll('"', '&quot;')}" ` +
                `width="${history[i]["banner"]["width"]}" ` +
                `height="${history[i]["banner"]["height"]}" ` +
                `onerror="this.style.opacity=0" loading="lazy">`+
            `
        </div>` : ''}
        <div class="popup-desc changelog-tags">${history[i]["version"]}</div>
        <div class="popup-desc changelog-subtitle">${history[i]["title"]}</div>
        <div class="popup-desc desc-padding">${history[i]["content"]}</div>`
    }
    render = cleanHTML(render);
    cache['0'] = render;
    return render;
}
