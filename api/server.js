import "dotenv/config";
import "./modules/util/alias-envs.js";

import express from "express";

import path from 'path';
import { fileURLToPath } from 'url';
import { runAPI } from "./core/endpoints.js";

import { Red } from "./modules/util/consoleText.js";
import { getCurrentBranch, shortCommit } from "./modules/util/currentCommit.js";

const app = express();

const gitCommit = shortCommit();
const gitBranch = getCurrentBranch();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4);

app.disable('x-powered-by');

if (process.env.API_URL) {
    runAPI(express, app, gitCommit, gitBranch, __dirname)
} else {
    console.log(
        Red(`cobalt wasn't configured yet or configuration is invalid. check if API_URL is present in env\n`)
    )
}
