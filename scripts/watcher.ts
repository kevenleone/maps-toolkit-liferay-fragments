import { spawn } from "bun";
import fs from "node:fs";
import path from "node:path";

const watchFolder = path.join(__dirname, "..", "maps-toolkit-fragment-set");

const DEPLOY_CHANGES_AFTER_MILISECONDS = 3000;

const buildCommand = ["bun", "run", "deploy"];

let timeout: NodeJS.Timeout | null = null;

console.log(`Watching folder: ${path.resolve(watchFolder)}...`);

fs.watch(watchFolder, { recursive: true }, (_, filename) => {
    if (!filename) {
        return;
    }

    console.log(`Change detected: ${filename}`);

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
        spawn(buildCommand, {
            stdout: "inherit",
            stderr: "inherit",
        });
    }, DEPLOY_CHANGES_AFTER_MILISECONDS);
});
