import { parseArgToValidate, scaffold } from "./utils.ts";
import * as inquirer from "@inquirer/prompts";
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

export const validatedInput =
  (
    getDefault?: (command: InteractiveCommand) => string,
    input = inquirer.input,
    parseArgToValidateFunction = parseArgToValidate,
  ) =>
  async (
    currentValue: string | undefined,
    option: InteractiveOption,
    command: InteractiveCommand,
  ) => {
    const answer = await input({
      message: option.description,
      default: currentValue ?? getDefault?.(command),
      validate: parseArgToValidateFunction(option.parseArg),
    });

    return option.parseArg
      ? option.parseArg(answer, undefined as unknown)
      : answer;
  };

export const createDirectoryNameOption = (
  validatedInputFunction = validatedInput,
  existsSyncFunction = fs.existsSync,
) =>
  new InteractiveOption("-d, --directory-name <name>", "directory name")
    .prompt(validatedInputFunction())
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
  validatedInputFunction = validatedInput,
) =>
  new InteractiveOption("-n, --package-name <name>", "package name")
    .prompt(
      validatedInputFunction((command) =>
        path.basename(command.getOptionValue("directoryName") as string),
      ),
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

export const createCommandNameOption = (
  validatedInputFunction = validatedInput,
) =>
  new InteractiveOption("-c, --command-name <name>", "command name")
    .prompt(
      validatedInputFunction(
        (command) => command.getOptionValue("packageName") as string,
      ),
    )
    .argParser((value) => {
      if (!isValidFilename(value)) {
        throw new InvalidArgumentError("Invalid command name");
      }

      return value;
    })
    .makeOptionMandatory();

export const createAction =
  (
    scaffoldFunction = scaffold,
    logFunction = console.log.bind(console) as typeof console.log,
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
    logFunction(`\nScaffolding project in ${directoryName}...`);

    await scaffoldFunction({
      targetDirectory: directoryName,
      commandName,
      packageName,
    });

    logFunction("\nDone. Now run:\n");
    logFunction(`  cd ${directoryName}`);
    logFunction("  npm install");
    logFunction("  npm run format");
  };

export const register: RegisterFunction = (command: InteractiveCommand) => {
  command
    .command("generate", { isDefault: true })
    .addOption(createDirectoryNameOption())
    .addOption(createPackageNameOption())
    .addOption(createCommandNameOption())
    .action(createAction());
};
