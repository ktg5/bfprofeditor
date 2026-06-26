import path from 'path';
import { fileURLToPath } from "url";
import fs from "fs";
import { rmStaging } from './rmStaging';

import config from "./config.json";


const __filename = fileURLToPath(import.meta.url);
// @ts-ignore
const __dirname = path.dirname(__filename);


/**
 * copy files so that linux moment doesn't happen
 */
async function copyFileStream(src: string, dest: string) {
    await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(src);
        const writeStream = fs.createWriteStream(dest);

        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("close", resolve);

        readStream.pipe(writeStream);
    });
}

/**
 * copy directory to new directory
 */
async function copyDir(sourceDir: string, newDir: string):Promise<void> {
    // Get dirs in the project folder.
    var dirs = fs.readdirSync(sourceDir, { withFileTypes: true });
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
    
    // now we finna do something with all of these dirs
    for (let entry of dirs) {
        // Folders & files that we AIN'T ALLOWIN'!
        if (
            entry.name === '.git' ||
            entry.name === '.github' ||
            entry.name === 'psds' ||
            entry.name === 'node_modules' ||
            entry.name === 'build.js' ||
            entry.name === 'package-lock.json' ||
            entry.name === 'package.json' ||
            entry.name === '.ignore'
        ) continue;

        // Paths
        var sourcePath = path.join(sourceDir, entry.name);
        var newPath = path.join(newDir, entry.name);
        switch (entry.name) {
            case "tobethereadme":
                newPath = path.join(newDir, "README");
            break;
        }

        // If the files passed the vibe check, we go.
        if (entry.isDirectory()) {
            await copyDir(sourcePath, newPath);
        } else {
            await copyFileStream(sourcePath, newPath);
        }
    }
}


export async function buildStaging():Promise<void> {
    return new Promise<void>((resolve) => {      
        // copy current html folder
        if (fs.existsSync(config.stagingHtmlDir)) rmStaging();
        console.log(`🔃 copying current "${config.baseHtmlDir}" folder to a "${config.stagingHtmlDir}" for Vite to compile...`);
        copyDir(config.baseHtmlDir, config.stagingHtmlDir).then(async () => {
            console.log('✅ copy complete!');
            resolve();
        });
    });
}
