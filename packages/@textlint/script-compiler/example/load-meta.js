const fs = require("fs/promises");
const maxBuffer = 1024 * 10;
const buffer = Buffer.alloc(maxBuffer);
(async function () {
    const fd = await fs.open(__dirname + "/textlint.js", "r");
    const r = await fd.read(buffer, 0, maxBuffer);
    const metadataPattenr = /\/*!(.*)\*\//;
    const match = String(r.buffer).match(metadataPattenr);
    if (!match) {
        throw new Error("Can not read metadata");
    }
    console.log(JSON.parse(match[1]))
})()
