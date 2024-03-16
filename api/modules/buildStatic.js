import { buildFront } from "./build.js";
import { getCurrentBranch, shortCommit } from "./sub/currentCommit.js";

const commitHash = shortCommit();
const branch = getCurrentBranch();

await buildFront(commitHash, branch);
