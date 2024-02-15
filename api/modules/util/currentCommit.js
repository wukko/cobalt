import { execSync } from "child_process";

let commit, commitInfo, branch;

export function shortCommit() {
    if (commit) return commit;
    let c = execSync('git rev-parse --short HEAD').toString().trim();
    commit = c;
    return c
}
export function getCommitInfo() {
    if (commitInfo) return commitInfo;
    let d = execSync(`git show -s --format='%s;;;%B'`).toString().trim().replace(/[\r\n]/gm, '\n').split(';;;');
    d[1] = d[1].replace(d[0], '').trim().toString().replace(/[\r\n]/gm, '<br>');
    commitInfo = d;
    return d
}
export function getCurrentBranch() {
    if (branch) return branch;
    let b = execSync('git branch --show-current').toString().trim();
    branch = b;
    return b
}
