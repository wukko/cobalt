import * as fs from "fs";

import path from 'path';
import { fileURLToPath } from 'url';

const splitDir = path.dirname(fileURLToPath(import.meta.url)).split('/');
splitDir.splice(-2);
const dir = splitDir.join('/');

export function loadJSON(path) {
    try {
        return JSON.parse(fs.readFileSync(`${dir}/${path}`, 'utf-8'))
    } catch(e) {
        return false
    }
}
export function loadFile(path) {
    try {
        return fs.readFileSync(path, 'utf-8')
    } catch(e) {
        return false
    }
}
