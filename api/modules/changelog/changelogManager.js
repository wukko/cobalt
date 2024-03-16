import { replaceBase } from "../../localization/manager.js";
import { loadJSON } from "../sub/loadFromFs.js";

let changelog = loadJSON('./src/modules/changelog/changelog.json')

export default function(string) {
    try {
        const currentChangelog = changelog.current;

        switch (string) {
            case "version":
                return `<span class="text-backdrop changelog-tag-version">v.${currentChangelog.version}</span>${
                    currentChangelog.date ? `<span class="changelog-tag-date">· ${currentChangelog.date}</span>` : ''
                }`
            case "title":
                return replaceBase(currentChangelog.title);
            case "banner":
                const currentBanner = changelog.current.banner;
                return currentBanner ? {
                    ...currentBanner,
                    url: `updateBanners/${currentBanner.file}`
                } : false;
            case "content":
                return replaceBase(currentChangelog.content);
            case "history":
                return changelog.history.map((log) => {
                    const banner = log.banner;
                    return {
                        title: replaceBase(log.title),
                        version: `<span class="text-backdrop changelog-tag-version">v.${log.version}</span>${
                            log.date ? `<span class="changelog-tag-date">· ${log.date}</span>` : ''
                        }`,
                        content: replaceBase(log.content),
                        banner: banner ? {
                            ...banner,
                            url: `updateBanners/${banner.file}`
                        } : false,
                    }
                });
            default:
                return replaceBase(changelog[string])
        }
    } catch (e) {
        return `!!CHANGELOG_${string}!!`
    }
}
