#!/usr/bin/env node
import childProcess from "node:child_process";
import { createRequire } from "node:module";

const tsxLoader = createRequire(import.meta.url).resolve("tsx");

childProcess.fork(
  new URL("../src/index.ts", import.meta.url),
  process.argv.slice(2),
  {
    execArgv: ["--no-warnings", "--loader", tsxLoader],
  },
);
