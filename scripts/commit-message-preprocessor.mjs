#!/usr/bin/env node
import readline from "node:readline";

const printVersions = (data) => {
  for (const [name, version] of Object.entries(data)) {
    console.log(`${name}: ${version}`);
  }
};

let lineNumber = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false, // This ensures readline doesn't treat input as a terminal
});

rl.on("line", (line) => {
  lineNumber += 1;

  if (lineNumber < 3) {
    console.log(line);
    return;
  }

  const newLine = line.replace(/^[^{]+/, "").trim();

  if (newLine === "") {
    return;
  }

  printVersions(JSON.parse(newLine));
});
