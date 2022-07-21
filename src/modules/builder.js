import { readFile, readdir } from "fs/promises";

import * as esbuild from "esbuild";

export async function buildJS () {
    let originalJS = await readFile('./src/static/cobalt.js', { encoding: 'utf-8' }),
        transformedJS = await esbuild.transform(originalJS, { minify: true });
    
    return transformedJS.code
}

export async function buildCSS () {
    let mainCSS = await readFile('./src/static/cobalt.css', { encoding: 'utf-8' }),
        fontCSS = await readFile('./src/static/fonts/notosansmono/notosansmono.css', { encoding: 'utf-8' }),
        fontFiles = (await readdir('./src/static/fonts/notosansmono/')).filter((f) => f.endsWith('.woff2')),
        transformedCSS = await esbuild.transform(fontCSS + mainCSS, { minify: true, loader: 'css' });
    
    const fontData = {}
    for (let index in fontFiles) {
        const filename = fontFiles[index]
        fontData[filename] = await readFile(`./src/static/fonts/notosansmono/${filename}`, { encoding: 'utf-8' })
    }
    
    return {
        code: transformedCSS.code,
        fontData: fontData
    }
}
