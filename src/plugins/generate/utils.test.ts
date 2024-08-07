import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import type { FileGenerator } from "templgen";
import { scaffold } from "./utils.ts";

await test("scaffold", async (t) => {
  const fileGenerator: FileGenerator = {
    async generate() {},
  } as unknown as FileGenerator;

  const generate = t.mock.method(fileGenerator, "generate");

  await scaffold({
    targetDirectory: "/dummy/directory",
    commandName: "dummy-command",
    packageName: "dummy-package",
    fileGenerator,
  });

  const sourceDirectory = fileURLToPath(
    new URL("../../../templates/generate", import.meta.url),
  );
  expect(generate.mock.calls.length).toBe(1);
  expect(generate.mock.calls[0].arguments).toEqual([
    sourceDirectory,
    "/dummy/directory",
    expect.any(Array),
    {
      __dirname: sourceDirectory,
      commandName: "dummy-command",
      directoryName: "/dummy/directory",
      packageName: "dummy-package",
    },
  ]);
});
