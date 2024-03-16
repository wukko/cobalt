import * as fs from "fs";

import path from 'path';
import { fileURLToPath } from 'url';

const splitDir = path.dirname(fileURLToPath(import.meta.url)).split('/');
splitDir.splice(-2);
const dir = splitDir.join('/');

export function loadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(`${dir}/${filePath}`, 'utf-8'))
    } catch(e) {
        return false
    }
}
