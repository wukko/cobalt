import { existsSync, unlinkSync, appendFileSync } from "fs";
import { createInterface } from "readline";
import { Cyan, Bright } from "./sub/consoleText.js";
import { loadJSON } from "./sub/loadFromFs.js";
import { execSync } from "child_process";

const { version } = loadJSON("./package.json");

let envPath = './.env';
let q = `${Cyan('?')} \x1b[1m`;
let ob = {};
let rl = createInterface({ input: process.stdin, output: process.stdout });

let final = () => {
    if (existsSync(envPath)) unlinkSync(envPath);

    for (let i in ob) {
        appendFileSync(envPath, `${i}=${ob[i]}\n`)
    }
    console.log(Bright("\nAwesome! I've created a fresh .env file for you."));
    console.log(`${Bright("Now I'll run")} ${Cyan("npm install")} ${Bright("to install all dependencies. It shouldn't take long.\n\n")}`);
    execSync('npm install', { stdio: [0, 1, 2] });
    console.log(`\n\n${Cyan("All done!\n")}`);
    console.log(Bright("You can re-run this script at any time to update the configuration."));
    console.log(Bright("\nYou're now ready to start cobalt. Simply run ") + Cyan("npm start") + Bright('!\nHave fun :)'));
    rl.close()
}

console.log(
    `${Cyan(`Hey, this is cobalt v.${version}!`)}\n${Bright("Let's start by creating a new ")}${Cyan(".env")}${Bright(" file. You can always change it later.")}`
)

function setup() {
    console.log(Bright("\nWhat kind of server will this instance be?\nOptions: api, web."));

    rl.question(q, r1 => {
        switch (r1.toLowerCase()) {
            case 'api':
                console.log(Bright("\nCool! What's the domain this API instance will be running on? (localhost)\nExample: co.wuk.sh"));

                rl.question(q, apiURL => {
                    ob.API_URL = `http://localhost:9000/`;
                    ob.API_PORT = 9000;
                    if (apiURL && apiURL !== "localhost") ob.API_URL = `https://${apiURL.toLowerCase()}/`;

                    console.log(Bright("\nGreat! Now, what port will it be running on? (9000)"));

                    rl.question(q, apiPort => {
                        if (apiPort) ob.API_PORT = apiPort;
                        if (apiPort && (apiURL === "localhost" || !apiURL)) ob.API_URL = `http://localhost:${apiPort}/`;

                        console.log(Bright("\nWhat will your instance's name be? Usually it's something like eu-nl aka region-country. (local)"));

                        rl.question(q, apiName => {
                            ob.API_NAME = apiName.toLowerCase();
                            if (!apiName || apiName === "local") ob.API_NAME = "local";

                            console.log(Bright("\nOne last thing: would you like to enable CORS? It allows other websites and extensions to use your instance's API.\ny/n (n)"));

                            rl.question(q, apiCors => {
                                let answCors = apiCors.toLowerCase().trim();
                                if (answCors !== "y" && answCors !== "yes") ob.CORS_WILDCARD = '0'
                                final()
                            })
                        })
                    });
    
                })
                break;
            case 'web':
                console.log(Bright("\nAwesome! What's the domain this web app instance will be running on? (localhost)\nExample: cobalt.tools"));
    
                rl.question(q, webURL => {
                    ob.WEB_URL = `http://localhost:9001/`;
                    ob.WEB_PORT = 9001;
                    if (webURL && webURL !== "localhost") ob.WEB_URL = `https://${webURL.toLowerCase()}/`;
    
                    console.log(
                        Bright("\nGreat! Now, what port will it be running on? (9001)")
                    )
                    rl.question(q, webPort => {
                        if (webPort) ob.WEB_PORT = webPort;
                        if (webPort && (webURL === "localhost" || !webURL)) ob.WEB_URL = `http://localhost:${webPort}/`;

                        console.log(
                            Bright("\nOne last thing: what default API domain should be used? (co.wuk.sh)\nIf it's hosted locally, make sure to include the port:") + Cyan(" localhost:9000")
                        );

                        rl.question(q, apiURL => {
                            ob.API_URL = `https://${apiURL.toLowerCase()}/`;
                            if (apiURL.includes(':')) ob.API_URL = `http://${apiURL.toLowerCase()}/`;
                            if (!apiURL) ob.API_URL = "https://co.wuk.sh/";
                            final()
                        })
                    });
    
                });
                break;
            default:
                console.log(Bright("\nThis is not an option. Try again."));
                setup()
        }
    })
}
setup()
