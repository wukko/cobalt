import "dotenv/config";
import "./modules/sub/alias-envs.js";

import express from "express";

import { Bright, Green, Red } from "./modules/sub/consoleText.js";
import { getCurrentBranch, shortCommit } from "./modules/sub/currentCommit.js";
import { loadLoc } from "./localization/manager.js";

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const gitCommit = shortCommit();
const gitBranch = getCurrentBranch();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4);

app.disable('x-powered-by');

await loadLoc();

const apiMode = process.env.API_URL && !process.env.WEB_URL;
const webMode = process.env.WEB_URL && process.env.API_URL;

if (apiMode) {
    const { runAPI } = await import('./core/api.js');
    runAPI(express, app, gitCommit, gitBranch, __dirname)
} else if (webMode) {
    const { runWeb } = await import('./core/web.js');
    await runWeb(express, app, gitCommit, gitBranch, __dirname)
} else {
    console.log(
        Red(`cobalt wasn't configured yet or configuration is invalid.\n`)
        + Bright(`please run the setup script to fix this: `)
        + Green(`npm run setup`)
    )
}
