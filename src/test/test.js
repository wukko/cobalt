import "dotenv/config";

import { getJSON } from "../modules/api.js";
import { services } from "../modules/config.js";
import { loadJSON } from "../modules/sub/loadFromFs.js";
import { checkJSONPost } from "../modules/sub/utils.js";

let tests = loadJSON('./src/test/tests.json');

let noTest = [];
let failed = [];
let success = 0;

function addToFail(service, testName, url, status, response) {
    failed.push({
        service: service,
        name: testName,
        url: url,
        status: status,
        response: response
    })
}
for (let i in services) {
    if (tests[i]) {
        console.log(`\nRunning tests for ${i}...\n`)
        for (let k = 0; k < tests[i].length; k++) {
            let test = tests[i][k];
            
            console.log(`Running test ${k+1}: ${test.name}`);
            console.log('params:');
            let params = {...{url: test.url}, ...test.params};
            console.log(params);

            let chck = checkJSONPost(params);
            if (chck) {
                chck["ip"] = "d21ec524bc2ade41bef569c0361ac57728c69e2764b5cb3cb310fe36568ca53f"; // random sha256
                let j = await getJSON(chck["url"], "en", chck);
                console.log('\nReceived:');
                console.log(j)
                if (j.status === test.expected.code && j.body.status === test.expected.status) {
                    console.log("\n✅ Success.\n");
                    success++
                } else {
                    console.log(`\n❌ Fail. Expected: ${test.expected.code} & ${test.expected.status}, received: ${j.status} & ${j.body.status}\n`);
                    addToFail(i, test.name, test.url, j.body.status, j)
                }
            } else {
                console.log("\n❌ couldn't validate the request JSON.\n");
                addToFail(i, test.name, test.url, "unknown", {})
            }
        }
        console.log("\n\n")
    } else {
        console.warn(`No tests found for ${i}.`);
        noTest.push(i)
    }
}

console.log(`✅ ${success} tests succeeded.`);
console.log(`❌ ${failed.length} tests failed.`);
console.log(`❔ ${noTest.length} services weren't tested.`);

if (failed.length > 0) {
    console.log(`\nFailed tests:`);
    console.log(failed)
}

if (noTest.length > 0) {
    console.log(`\nMissing tests:`);
    console.log(noTest)
}
