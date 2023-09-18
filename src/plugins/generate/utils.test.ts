/* eslint-disable @typescript-eslint/no-empty-function */
import { scaffold } from "./utils.ts";
import { expect } from "expect";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { type FileGenerator } from "templgen";

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

  expect(generate.mock.calls.length).toBe(1);
  expect(generate.mock.calls[0].arguments).toEqual([
    fileURLToPath(new URL("../../../templates", import.meta.url)),
    "/dummy/directory",
    expect.any(Array),
    {
      commandName: "dummy-command",
      directoryName: "/dummy/directory",
      packageName: "dummy-package",
    },
  ]);
});
