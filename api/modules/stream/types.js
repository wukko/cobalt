import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";
import { ffmpegArgs, genericUserAgent } from "../config.js";
import { metadataManager } from "../sub/utils.js";
import { request } from "undici";
import { create as contentDisposition } from "content-disposition-header";

function closeRequest(controller) {
    try { controller.abort() } catch {}
}

function closeResponse(res) {
    if (!res.headersSent) res.sendStatus(500);
    return res.destroy();
}

function killProcess(p) {
    // ask the process to terminate itself gracefully
    p?.kill('SIGTERM');
    setTimeout(() => {
        if (p?.exitCode === null)
            // brutally murder the process if it didn't quit
            p?.kill('SIGKILL');
    }, 5000);
}

function pipe(from, to, done) {
    from.on('error', done)
        .on('close', done);

    to.on('error', done)
      .on('close', done);

    from.pipe(to);
}

function getCommand(args) {
    if (process.env.PROCESSING_PRIORITY && process.platform !== "win32") {
        return ['nice', ['-n', process.env.PROCESSING_PRIORITY, ffmpeg, ...args]]
    }
    return [ffmpeg, args]
}

export async function streamDefault(streamInfo, res) {
    const abortController = new AbortController();
    const shutdown = () => (closeRequest(abortController), closeResponse(res));

    try {
        let filename = streamInfo.filename;
        if (streamInfo.isAudioOnly) {
            filename = `${streamInfo.filename}.${streamInfo.audioFormat}`
        }
        res.setHeader('Content-disposition', contentDisposition(filename));

        const { body: stream, headers } = await request(streamInfo.urls, {
            headers: { 'user-agent': genericUserAgent },
            signal: abortController.signal,
            maxRedirections: 16
        });

        res.setHeader('content-type', headers['content-type']);
        res.setHeader('content-length', headers['content-length']);

        pipe(stream, res, shutdown);
    } catch {
        shutdown();
    }
}

export async function streamLiveRender(streamInfo, res) {
    let abortController = new AbortController(), process;
    const shutdown = () => (
        closeRequest(abortController),
        killProcess(process),
        closeResponse(res)
    );

    try {
        if (streamInfo.urls.length !== 2) return shutdown();

        const { body: audio } = await request(streamInfo.urls[1], {
            maxRedirections: 16, signal: abortController.signal,
            headers: {
                'user-agent': genericUserAgent,
                referer: streamInfo.service === 'bilibili'
                            ? 'https://www.bilibili.com/'
                            : undefined,
            }
        });

        const format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1];
        let args = [
            '-loglevel', '-8',
            '-user_agent', genericUserAgent
        ];

        if (streamInfo.service === 'bilibili') {
            args.push(
                '-headers', 'Referer: https://www.bilibili.com/\r\n',
            )
        }

        args.push(
            '-i', streamInfo.urls[0],
            '-i', 'pipe:3',
            '-map', '0:v',
            '-map', '1:a',
        );

        args = args.concat(ffmpegArgs[format]);
        if (streamInfo.metadata) {
            args = args.concat(metadataManager(streamInfo.metadata))
        }
        args.push('-f', format, 'pipe:4');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe'
            ],
        });

        const [,,, audioInput, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        audio.on('error', shutdown);
        audioInput.on('error', shutdown);
        audio.pipe(audioInput);
        pipe(muxOutput, res, shutdown);

        process.on('close', shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

export function streamAudioOnly(streamInfo, res) {
    let process;
    const shutdown = () => (killProcess(process), closeResponse(res));

    try {
        let args = [
            '-loglevel', '-8',
            '-user_agent', genericUserAgent
        ];

        if (streamInfo.service === "twitter") {
            args.push('-seekable', '0');
        } else if (streamInfo.service === 'bilibili') {
            args.push('-headers', 'Referer: https://www.bilibili.com/\r\n');
        }

        args.push(
            '-i', streamInfo.urls,
            '-vn'
        )

        if (streamInfo.metadata) {
            args = args.concat(metadataManager(streamInfo.metadata))
        }
        let arg = streamInfo.copy ? ffmpegArgs["copy"] : ffmpegArgs["audio"];
        args = args.concat(arg);

        if (ffmpegArgs[streamInfo.audioFormat]) {
            args = args.concat(ffmpegArgs[streamInfo.audioFormat])
        }
        args.push('-f', streamInfo.audioFormat === "m4a" ? "ipod" : streamInfo.audioFormat, 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(`${streamInfo.filename}.${streamInfo.audioFormat}`));

        pipe(muxOutput, res, shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

export function streamVideoOnly(streamInfo, res) {
    let process;
    const shutdown = () => (killProcess(process), closeResponse(res));

    try {
        let args = [
            '-loglevel', '-8'
        ]

        if (streamInfo.service === "twitter") {
            args.push('-seekable', '0')
        } else if (streamInfo.service === 'bilibili') {
            args.push('-headers', 'Referer: https://www.bilibili.com/\r\n')
        }

        args.push(
            '-i', streamInfo.urls,
            '-c', 'copy'
        )

        if (streamInfo.mute) {
            args.push('-an')
        }

        if (["vimeo", "rutube", "dailymotion"].includes(streamInfo.service)) {
            args.push('-bsf:a', 'aac_adtstoasc')
        }

        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1];
        if (format === "mp4") {
            args.push('-movflags', 'faststart+frag_keyframe+empty_moov')
        }
        args.push('-f', format, 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        pipe(muxOutput, res, shutdown);

        process.on('close', shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

export function convertToGif(streamInfo, res) {
    let process;
    const shutdown = () => (killProcess(process), closeResponse(res));

    try {
        let args = [
            '-loglevel', '-8'
        ]
        if (streamInfo.service === "twitter") {
            args.push('-seekable', '0')
        }
        args.push('-i', streamInfo.urls)
        args = args.concat(ffmpegArgs["gif"]);
        args.push('-f', "gif", 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename.split('.')[0] + ".gif"));

        pipe(muxOutput, res, shutdown);

        process.on('close', shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}
