import { test } from "node:test";
import { expect } from "expect";
import type {
  InteractiveCommand,
  InteractiveOption,
} from "interactive-commander";
import {
  createAction,
  createCommandNameOption,
  createDirectoryNameOption,
  createPackageNameOption,
  setPromptDefault,
} from "./index.ts";

await test("setPromptDefault", async (t) => {
  const originalReadFunction = t.mock.fn();
  const option = {
    readFunction: originalReadFunction,
  } as unknown as InteractiveOption;
  const callback = t.mock.fn(() => "default value");

  setPromptDefault(option, callback);
  expect(option.readFunction).not.toBe(originalReadFunction);

  await option.readFunction?.(
    undefined,
    option,
    undefined as unknown as InteractiveCommand,
  );

  expect(originalReadFunction.mock.callCount()).toBe(1);
  expect(callback.mock.callCount()).toBe(1);
});

await test("createDirectoryNameOption", async (t) => {
  await t.test("should be mandatory", async () => {
    const directoryNameOption = createDirectoryNameOption();
    expect(directoryNameOption.required).toBe(true);
  });

  await t.test("should throw when directory name is not valid", async () => {
    const directoryNameOption = createDirectoryNameOption();

    expect(() => {
      directoryNameOption.parseArg?.(
        "invalid/directory/name",
        undefined as unknown,
      );
    }).toThrow();
  });

  await t.test("should not throw when directory name is valid", async (t) => {
    await t.test("when directory exists", async () => {
      const existsSyncFunction = t.mock.fn(() => true);

      const directoryNameOption = createDirectoryNameOption(existsSyncFunction);

      expect(() => {
        directoryNameOption.parseArg?.("valid", undefined as unknown);
      }).toThrow();
    });

    await t.test("when directory does not exist", async () => {
      const existsSyncFunction = t.mock.fn(() => false);

      const directoryNameOption = createDirectoryNameOption(existsSyncFunction);

      expect(() => {
        directoryNameOption.parseArg?.("valid", undefined as unknown);
      }).not.toThrow();
    });
  });
});

await test("createPackageNameOption", async (t) => {
  await t.test("should be mandatory", async () => {
    const packageNameOption = createPackageNameOption();
    expect(packageNameOption.required).toBe(true);
  });

  await t.test(
    "should set the default value to the directory name",
    async (t) => {
      const setPromptDefault = t.mock.fn();
      createPackageNameOption(setPromptDefault);

      expect(setPromptDefault.mock.callCount()).toBe(1);
      const callback = setPromptDefault.mock.calls[0].arguments[1] as (
        command: InteractiveCommand,
      ) => string;
      const command = {
        getOptionValue() {
          return "/a/b/c";
        },
      } as unknown as InteractiveCommand;
      expect(callback(command)).toBe("c");
    },
  );

  await t.test("should throw when package name is not valid", async (t) => {
    const packageNameOption = createPackageNameOption();
    expect(() => {
      packageNameOption.parseArg?.(
        "invalid/package/name",
        undefined as unknown,
      );
    }).toThrow();
  });

  await t.test("should not throw when package name is valid", async (t) => {
    const packageNameOption = createPackageNameOption();
    expect(() => {
      packageNameOption.parseArg?.("valid-package-name", undefined as unknown);
    }).not.toThrow();
  });
});

await test("createCommandNameOption", async (t) => {
  await t.test("should be mandatory", async () => {
    const commandNameOption = createCommandNameOption();
    expect(commandNameOption.required).toBe(true);
  });

  await t.test(
    "should set the default value to the package name",
    async (t) => {
      const setPromptDefault = t.mock.fn();
      createPackageNameOption(setPromptDefault);

      expect(setPromptDefault.mock.callCount()).toBe(1);
      const callback = setPromptDefault.mock.calls[0].arguments[1] as (
        command: InteractiveCommand,
      ) => string;
      const command = {
        getOptionValue() {
          return "package-name";
        },
      } as unknown as InteractiveCommand;
      expect(callback(command)).toBe("package-name");
    },
  );

  await t.test("should throw when command name is not valid", async (t) => {
    const commandNameOption = createCommandNameOption();
    expect(() => {
      commandNameOption.parseArg?.(
        "invalid/command/name",
        undefined as unknown,
      );
    }).toThrow();
  });

  await t.test("should not throw when command name is valid", async (t) => {
    const commandNameOption = createCommandNameOption();
    expect(() => {
      commandNameOption.parseArg?.("valid-command-name", undefined as unknown);
    }).not.toThrow();
  });
});

await test("createAction", async (t) => {
  const scaffoldFunction = t.mock.fn(() => Promise.resolve());
  const logFunction = t.mock.fn();

  const action = createAction(scaffoldFunction, logFunction);

  t.beforeEach(() => {
    scaffoldFunction.mock.resetCalls();
    logFunction.mock.resetCalls();
  });

  await t.test("should call the scaffold function", async () => {
    await action({
      directoryName: "/path/to/directory",
      commandName: "commandName",
      packageName: "packageName",
    });

    expect(scaffoldFunction.mock.callCount()).toBe(1);
    expect(scaffoldFunction.mock.calls[0].arguments).toStrictEqual([
      {
        targetDirectory: "/path/to/directory",
        packageName: "packageName",
        commandName: "commandName",
      },
    ]);
  });

  await t.test("should call the log function", async () => {
    await action({
      directoryName: "/path/to/directory",
      commandName: "commandName",
      packageName: "packageName",
    });

    expect(logFunction.mock.callCount()).toBe(4);
  });
});
