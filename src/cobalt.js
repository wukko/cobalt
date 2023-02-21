import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import rateLimit from 'express-rate-limit';

import { getCurrentBranch, shortCommit } from './modules/sub/currentCommit.js';
import { appName, genericUserAgent, version } from './modules/config.js';
import { getJSON } from './modules/api.js';
import renderPage from './modules/pageRender/page.js';
import { apiJSON, checkJSONPost, languageCode } from './modules/sub/utils.js';
import { Bright, Cyan, Green, Red } from './modules/sub/consoleText.js';
import stream from './modules/stream/stream.js';
import loc from './localization/manager.js';
import { buildFront } from './modules/build.js';
import { changelogHistory } from './modules/pageRender/onDemand.js';
import { sha256 } from './modules/sub/crypto.js';

const commitHash = shortCommit();
const branch = getCurrentBranch();
const app = express();
const corsMiddleware = cors({
    origin: process.env.selfURL,
    optionsSuccessStatus: 200,
});

app.disable('x-powered-by');

if (
    !fs.existsSync('./.env') ||
    !process.env.selfURL ||
    !process.env.streamSalt ||
    !process.env.port
) {
    console.log(
        Red("cobalt hasn't been configured yet or configuration is invalid.\n")
    );
    console.log(
        Bright('please run the setup script to fix this: ') +
            Green('npm run setup')
    );
    process.exit(1);
}

const apiLimiter = rateLimit({
    windowMs: 60000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, _opt) => {
        res.status(429).json({
            status: 'error',
            text: loc(languageCode(req), 'ErrorRateLimit'),
        });
    },
});

const apiLimiterStream = rateLimit({
    windowMs: 60000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next, _opt) => {
        res.status(429).json({
            status: 'error',
            text: loc(languageCode(req), 'ErrorRateLimit'),
        });
    },
});

await buildFront();
app.use('/api/', apiLimiter);
app.use('/api/stream', apiLimiterStream);
app.use('/', express.static('./min'));
app.use('/', express.static('./src/front'));

app.use((req, res, next) => {
    try {
        decodeURIComponent(req.path);
    } catch (e) {
        return res.redirect(process.env.selfURL);
    }
    next();
});

app.use((req, res, next) => {
    if (
        req.header('user-agent') &&
        req.header('user-agent').includes('Trident')
    ) {
        res.destroy();
    }
    next();
});

app.use(
    '/api/json',
    express.json({
        verify: (req, res, buf) => {
            try {
                JSON.parse(buf);
                if (buf.length > 720) throw new Error();
            } catch (e) {
                res.status(500).json({
                    status: 'error',
                    text: 'invalid json body.',
                });
            }

            if (String(req.header('Content-Type')) !== 'application/json') {
                res.status(500).json({
                    status: 'error',
                    text: 'invalid content type header',
                });
            }

            if (String(req.header('Accept')) !== 'application/json') {
                res.status(500).json({
                    status: 'error',
                    text: 'invalid accept header',
                });
            }
        },
    })
);

app.post('/api/:type', corsMiddleware, async (req, res) => {
    try {
        let ip = sha256(
            req.header('x-forwarded-for')
                ? req.header('x-forwarded-for')
                : req.ip.replace('::ffff:', ''),
            process.env.streamSalt
        );
        switch (req.params.type) {
            case 'json':
                try {
                    let request = req.body;
                    let chck = checkJSONPost(request);
                    if (request.url && chck) {
                        chck['ip'] = ip;
                        let j = await getJSON(
                            chck['url'],
                            languageCode(req),
                            chck
                        );
                        res.status(j.status).json(j.body);
                    } else if (request.url && !chck) {
                        let j = apiJSON(0, {
                            t: loc(languageCode(req), 'ErrorCouldntFetch'),
                        });
                        res.status(j.status).json(j.body);
                    } else {
                        let j = apiJSON(0, {
                            t: loc(languageCode(req), 'ErrorNoLink'),
                        });
                        res.status(j.status).json(j.body);
                    }
                } catch (e) {
                    res.status(500).json({
                        status: 'error',
                        text: loc(languageCode(req), 'ErrorCantProcess'),
                    });
                }
                break;
            default:
                let j = apiJSON(0, { t: 'unknown response type' });
                res.status(j.status).json(j.body);
                break;
        }
    } catch (e) {
        res.status(500).json({
            status: 'error',
            text: loc(languageCode(req), 'ErrorCantProcess'),
        });
    }
});

app.get('/api/:type', corsMiddleware, (req, res) => {
    try {
        let ip = sha256(
            req.header('x-forwarded-for')
                ? req.header('x-forwarded-for')
                : req.ip.replace('::ffff:', ''),
            process.env.streamSalt
        );
        switch (req.params.type) {
            case 'json':
                res.status(405).json({
                    status: 'error',
                    text: 'GET method for this endpoint has been deprecated. see https://github.com/wukko/cobalt/blob/current/docs/API.md for up-to-date API documentation.',
                });
                break;
            case 'stream':
                if (req.query.p) {
                    res.status(200).json({ status: 'continue' });
                    break;
                }

                if (!(req.query.t && req.query.h && req.query.e)) {
                    let j = apiJSON(0, { t: 'no stream id' });
                    res.status(j.status).json(j.body);
                    break;
                }

                stream(res, ip, req.query.t, req.query.h, req.query.e);
                break;
            case 'onDemand': {
                if (!req.query.blockId) {
                    let j = apiJSON(0, { t: 'no block id' });
                    res.status(j.status).json(j.body);
                    break;
                }

                let blockId = req.query.blockId.slice(0, 3);
                let r, j;
                switch (blockId) {
                    case '0':
                        r = changelogHistory();
                        j = r
                            ? apiJSON(3, { t: r })
                            : apiJSON(0, {
                                  t: "couldn't render this block",
                              });
                        break;
                    default:
                        j = apiJSON(0, {
                            t: "couldn't find a block with this id",
                        });
                        break;
                }
                res.status(j.status).json(j.body);
                break;
            }
            default:
                let j = apiJSON(0, { t: 'unknown response type' });
                res.status(j.status).json(j.body);
                break;
        }
    } catch (e) {
        res.status(500).json({
            status: 'error',
            text: loc(languageCode(req), 'ErrorCantProcess'),
        });
    }
});

app.get('/api', (_req, res) => {
    res.redirect('/api/json');
});
app.get('/', (req, res) => {
    res.send(
        renderPage({
            hash: commitHash,
            type: 'default',
            lang: languageCode(req),
            useragent: req.header('user-agent')
                ? req.header('user-agent')
                : genericUserAgent,
            branch: branch,
        })
    );
});

app.get('/favicon.ico', (_req, res) => {
    res.redirect('/icons/favicon.ico');
});
app.get('/*', (_req, res) => {
    res.redirect('/');
});

app.listen(process.env.port, () => {
    let startTime = new Date();
    console.log(
        `\n${Cyan(appName)} ${Bright(`v.${version}-${commitHash} (${branch})`)}`
    );
    console.log(
        `Start time: ${Bright(
            `${startTime.toUTCString()} (${Math.floor(new Date().getTime())})`
        )}\n`
    );
    if (process.env.port !== 80) {
        console.log(
            `URL: ${Cyan(
                `${process.env.selfURL.slice(0, -1)}:${process.env.port}/`
            )}`
        );
    } else {
        console.log(`URL: ${Cyan(`${process.env.selfURL}`)}`);
    }
    console.log(`Port: ${process.env.port}`);
});
