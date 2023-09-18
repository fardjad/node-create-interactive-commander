import { glob } from "glob";
import { fileURLToPath } from "node:url";
import { FileGenerator } from "templgen";

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
