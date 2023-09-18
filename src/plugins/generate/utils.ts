import { glob } from "glob";
import { fileURLToPath } from "node:url";
import { FileGenerator } from "templgen";

export const parseArgToValidate =
  (parseArg?: (value: string, previous: unknown) => unknown) =>
  (value: string) => {
    if (!parseArg) {
      return true;
    }

    try {
      parseArg(value, undefined as unknown);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      throw error;
    }
  };

export const scaffold = async (options: {
  targetDirectory: string;
  commandName: string;
  packageName: string;
  fileGenerator?: FileGenerator;
}) => {
  const sourceDirectory = fileURLToPath(
    new URL("../../../templates", import.meta.url),
  );

  const fileGenerator =
    options.fileGenerator ??
    new FileGenerator({
      templateExtension: ".ejs",
    });

  await fileGenerator.generate(
    sourceDirectory,
    options.targetDirectory,
    await glob("**/*", {
      cwd: sourceDirectory,
      nodir: true,
      absolute: true,
      dot: true,
    }),
    {
      directoryName: options.targetDirectory,
      commandName: options.commandName,
      packageName: options.packageName,
    },
  );
};
