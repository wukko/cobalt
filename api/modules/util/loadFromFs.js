import * as fs from "fs";

export function loadJSON(path) {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf-8'))
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
