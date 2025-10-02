import { readFileSync, writeFileSync } from "fs";
import { Lexer } from "./lexer.js";
import Parser from "./parser.js";
import ClosureConversion from "./closure-conversion.js";
import { CompilerError } from "./error.js";
import codeGenProgram from "./code-generation.js";

const args = process.argv.slice(2);

if (!args[0] || !args[1]) {
    console.error(
        `Usage: node ${process.argv[1]} <source> <output> [--dump-surface] [--dump-core]`
    );
    process.exit(1);
}

const sourceFile = args[0];
const outputFile = args[1];
const dumpSurface = args.includes("--dump-surface");
const dumpCore = args.includes("--dump-core");

let source: string;
try {
    source = readFileSync(sourceFile, "utf-8");
} catch (err: any) {
    if (err.code === "ENOENT") {
        console.error(`File not found: ${sourceFile}`);
    } else {
        console.error("Error reading file: ", err);
    }
    process.exit(1);
}

function dump(label: string, content: string) {
    const sep = "=".repeat(40);
    console.log(`${sep}\n>>> ${label}\n${sep}`);
    console.log(content);
    console.log("");
}

try {
    const tokens = new Lexer(source).scanTokens();

    const surfaceProgram = new Parser(tokens).parseProgram();
    if (dumpSurface) {
        dump(
            "Surface Intermediate Representation",
            surfaceProgram.prettyPrint()
        );
    }

    const coreProgram = new ClosureConversion().convProgram(surfaceProgram);
    if (dumpCore) {
        dump("Core Intermediate Representation", coreProgram.prettyPrint());
    }

    const bashScript = codeGenProgram(coreProgram);
    writeFileSync(outputFile, bashScript);
} catch (err) {
    if (err instanceof CompilerError) {
        console.error(err.message);
        process.exit(1);
    } else {
        throw err;
    }
}
