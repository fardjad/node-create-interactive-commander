import { scaffold } from "./utils.ts";
import {
  CommanderError,
  type InteractiveCommand,
  InteractiveOption,
  InvalidArgumentError,
  type RegisterFunction,
} from "interactive-commander";
import fs from "node:fs";
import path from "node:path";
import isValidFilename from "valid-filename";
import validatePackageName from "validate-npm-package-name";

/**
 * Set the default value of an option to the return value of a callback function.
 * This is useful for creating dependant prompts for options.
 *
 * @param option
 * @param callback - A function that returns the default value for the option
 */
export const setPromptDefault = (
  option: InteractiveOption,
  callback: (command: InteractiveCommand) => string,
) => {
  let { readFunction } = option;
  readFunction = readFunction?.bind(option) as typeof readFunction;

  option.readFunction = async (
    currentValue: unknown,
    option: InteractiveOption,
    command: InteractiveCommand,
  ) =>
    readFunction?.(
      currentValue ?? (await Promise.resolve(callback(command))),
      option,
      command,
    );
};

export const createDirectoryNameOption = (existsSyncFunction = fs.existsSync) =>
  new InteractiveOption("-d, --directory-name <name>", "directory name")
    .argParser((value) => {
      if (!isValidFilename(value)) {
        throw new InvalidArgumentError("Invalid directory name");
      }

      if (existsSyncFunction(path.join(process.cwd(), value))) {
        throw new CommanderError(
          -1,
          "directoryExists",
          `Directory already exists`,
        );
      }

      return path.join(process.cwd(), value);
    })
    .makeOptionMandatory();

export const createPackageNameOption = (
  setPromptDefaultFunction = setPromptDefault,
) => {
  const option = new InteractiveOption(
    "-n, --package-name <name>",
    "package name",
  )
    .argParser((value) => {
      const { validForNewPackages, errors } = validatePackageName(value);

      if (!validForNewPackages) {
        throw new InvalidArgumentError(
          errors?.join("\n") ?? "Invalid package name",
        );
      }

      return value;
    })
    .makeOptionMandatory();

  setPromptDefaultFunction(option, (command) => {
    const directoryName = command.getOptionValue("directoryName") as string;
    return path.basename(directoryName);
  });

  return option;
};

export const createCommandNameOption = (
  setPromptDefaultFunction = setPromptDefault,
) => {
  const option = new InteractiveOption(
    "-c, --command-name <name>",
    "command name",
  )
    .argParser((value) => {
      if (!isValidFilename(value)) {
        throw new InvalidArgumentError("Invalid command name");
      }

      return value;
    })
    .makeOptionMandatory();

  setPromptDefaultFunction(
    option,
    (command) => command.getOptionValue("packageName") as string,
  );

  return option;
};

export const createAction =
  (
    scaffoldFunction = scaffold,
    log = console.log.bind(console) as typeof console.log,
  ) =>
  async ({
    directoryName,
    commandName,
    packageName,
  }: {
    directoryName: string;
    commandName: string;
    packageName: string;
  }) => {
    log(`\nScaffolding project in ${directoryName}...`);

    await scaffoldFunction({
      targetDirectory: directoryName,
      commandName,
      packageName,
    });

    log("\nDone. Now run:\n");
    log(`  cd ${directoryName}`);
    log("  npm install");
    log("  npm run format");
  };

export const register: RegisterFunction = (command: InteractiveCommand) => {
  command
    .command("generate", { isDefault: true })
    .addOption(createDirectoryNameOption())
    .addOption(createPackageNameOption())
    .addOption(createCommandNameOption())
    .action(createAction());
};
