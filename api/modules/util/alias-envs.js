import { Red } from "./consoleText.js";

const mapping = {
    apiPort: 'API_PORT',
    apiURL: 'API_URL',
    apiName: 'API_NAME',
    cors: 'CORS_WILDCARD',
    cookiePath: 'COOKIE_PATH',
    webPort: 'WEB_PORT',
    webURL: 'WEB_URL',
    showSponsors: 'SHOW_SPONSORS',
    isBeta: 'IS_BETA'
}

for (const [ oldEnv, newEnv ] of Object.entries(mapping)) {
    if (process.env[oldEnv] && !process.env[newEnv]) {
        process.env[newEnv] = process.env[oldEnv];
        console.error(`${Red('[!]')} ${oldEnv} is deprecated and will be removed in a future version.`);
        console.error(`    You should use ${newEnv} instead.`);
        console.error();
        delete process.env[oldEnv];
    }
}
