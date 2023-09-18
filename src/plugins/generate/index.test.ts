/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/promise-function-async, unicorn/consistent-function-scoping */
import {
  createAction,
  createCommandNameOption,
  createDirectoryNameOption,
  createPackageNameOption,
  validatedInput,
} from "./index.ts";
import { expect } from "expect";
import {
  type InteractiveOption,
  type InteractiveCommand,
} from "interactive-commander";
import { test } from "node:test";

class CancelablePromise<T> extends Promise<T> {
  cancel: () => void;
}

await test("validateInput", async (t) => {
  const getDefault = t.mock.fn(() => "default");
  const input = t.mock.fn(
    () =>
      new CancelablePromise<string>((resolve) => {
        resolve("value");
      }),
  );
  const parseArgToValidate = t.mock.fn(() => () => true);

  const option = {
    description: "description",
    parseArg() {},
  } as unknown as InteractiveOption;
  const command = {} as unknown as InteractiveCommand;

  t.beforeEach(() => {
    getDefault.mock.resetCalls();
    input.mock.resetCalls();
    parseArgToValidate.mock.resetCalls();
  });

  await t.test(
    "should call getDefault when currentValue is undefined",
    async () => {
      await validatedInput(getDefault, input)(undefined, option, command);
      expect(getDefault.mock.callCount()).toBe(1);
      expect(getDefault.mock.calls[0].arguments).toStrictEqual([command]);
    },
  );

  await t.test(
    "should not call getDefault when currentValue is defined",
    async () => {
      await validatedInput(getDefault, input)("currentValue", option, command);
      expect(getDefault.mock.callCount()).toBe(0);
    },
  );

  await t.test("should call input", async () => {
    await validatedInput(getDefault, input, parseArgToValidate)(
      "currentValue",
      option,
      command,
    );
    expect(input.mock.callCount()).toBe(1);
    expect(input.mock.calls[0].arguments).toStrictEqual([
      {
        message: option.description,
        default: "currentValue",
        validate: expect.any(Function),
      },
    ]);
    expect(parseArgToValidate.mock.callCount()).toBe(1);
    expect(parseArgToValidate.mock.calls[0].arguments).toStrictEqual([
      option.parseArg,
    ]);
  });

  await t.test(
    "should return 'answer' when parseArg is undefined",
    async () => {
      const result = await validatedInput(
        getDefault,
        input,
        parseArgToValidate,
      )(
        "currentValue",
        { ...option, parseArg: undefined } as unknown as InteractiveOption,
        command,
      );

      expect(result).toBe("value");
    },
  );
});

await test("createDirectoryNameOption", async (t) => {
  await t.test("should be mandatory", async () => {
    const directoryNameOption = createDirectoryNameOption();
    expect(directoryNameOption.required).toBe(true);
  });

  await t.test("should throw when directory name is not valid", async () => {
    const directoryNameOption = createDirectoryNameOption();

    expect(() => {
      directoryNameOption.parseArg!(
        "invalid/directory/name",
        undefined as unknown,
      );
    }).toThrow();
  });

  await t.test("should not throw when directory name is valid", async (t) => {
    await t.test("when directory exists", async () => {
      const existsSyncFunction = t.mock.fn(() => true);

      const directoryNameOption = createDirectoryNameOption(
        validatedInput,
        existsSyncFunction,
      );

      expect(() => {
        directoryNameOption.parseArg!("valid", undefined as unknown);
      }).toThrow();
    });

    await t.test("when directory does not exist", async () => {
      const existsSyncFunction = t.mock.fn(() => false);

      const directoryNameOption = createDirectoryNameOption(
        validatedInput,
        existsSyncFunction,
      );

      expect(() => {
        directoryNameOption.parseArg!("valid", undefined as unknown);
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
    "should use the basename of the directory as default",
    async (t) => {
      const fakeCommand = {
        getOptionValue() {
          return "full/path/to/dir";
        },
      } as unknown as InteractiveCommand;
      const fakeValidatedInputFunction = t.mock.fn(
        () => () =>
          new CancelablePromise<string>((resolve) => {
            resolve("value");
          }),
      );
      createPackageNameOption(fakeValidatedInputFunction);
      const getDefaultFunction = (
        fakeValidatedInputFunction.mock.calls[0].arguments as unknown[]
      ).at(0) as (command: InteractiveCommand) => string;
      expect(getDefaultFunction(fakeCommand)).toBe("dir");
    },
  );

  await t.test("should throw when package name is not valid", async (t) => {
    const packageNameOption = createPackageNameOption();
    expect(() => {
      packageNameOption.parseArg!("invalid/package/name", undefined as unknown);
    }).toThrow();
  });

  await t.test("should not throw when package name is valid", async (t) => {
    const packageNameOption = createPackageNameOption();
    expect(() => {
      packageNameOption.parseArg!("valid-package-name", undefined as unknown);
    }).not.toThrow();
  });
});

await test("createCommandNameOption", async (t) => {
  await t.test("should be mandatory", async () => {
    const commandNameOption = createCommandNameOption();
    expect(commandNameOption.required).toBe(true);
  });

  await t.test("should throw when command name is not valid", async (t) => {
    const commandNameOption = createCommandNameOption();
    expect(() => {
      commandNameOption.parseArg!("invalid/command/name", undefined as unknown);
    }).toThrow();
  });

  await t.test("should not throw when command name is valid", async (t) => {
    const commandNameOption = createCommandNameOption();
    expect(() => {
      commandNameOption.parseArg!("valid-command-name", undefined as unknown);
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

    expect(logFunction.mock.callCount()).toBe(5);
  });
});
