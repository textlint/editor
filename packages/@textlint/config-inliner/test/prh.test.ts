import { prh } from "../src/rules/prh";
import path from "path";
import assert from "assert";
import * as fs from "fs";

describe("prh", function () {
    it("inline rulePaths to ruleContents", async () => {
        const prhOptions = await prh({
            rulePaths: [path.join(__dirname, "fixtures/prh/prh.yml")]
        });
        assert.deepStrictEqual(prhOptions, {
            rulePaths: [],
            ruleContents: [fs.readFileSync(path.join(__dirname, "fixtures/prh/prh.yml"), "utf-8")]
        });
    });
});
