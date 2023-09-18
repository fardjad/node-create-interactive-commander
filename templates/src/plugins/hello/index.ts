import { type RegisterFunction } from "interactive-commander";

export const register: RegisterFunction = (commander) => {
  commander
    .command("hello")
    .requiredOption("-n, --name <name>", "your name")
    .action(({ name }) => {
      console.log(`Hello ${name}!`);
    });
};
