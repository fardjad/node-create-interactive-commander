import { glob } from "glob";
import { CommanderError, InteractiveCommand } from "interactive-commander";

const program = new InteractiveCommand();

// Replace this with your own logic for loading plugins if you want to use a
// different pattern
for (const file of await glob("*/index.ts", {
  absolute: true,
  cwd: new URL("plugins", import.meta.url),
})) {
  program.use(file);
}

try {
  await program.interactive("-I, --no-interactive").parseAsync();
} catch (error) {
  if (error instanceof CommanderError) {
    console.error(error.message);
    process.exit(error.exitCode);
  }

  // Inquirer throws an error when the user force closes the prompt with Ctrl+C
  if (
    error instanceof Error &&
    error.message.startsWith("User force closed the prompt with 0 null")
  ) {
    process.exit(0);
  }

  throw error;
}
