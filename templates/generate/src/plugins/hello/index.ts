import { type RegisterFunction } from "interactive-commander";

export const createAction =
  (log = console.log.bind(console) as typeof console.log) =>
  ({ name }: { name: string }) => {
    log(`Hello ${name}!`);
  };

export const register: RegisterFunction = (commander) => {
  commander
    .command("hello")
    .requiredOption("-n, --name <name>", "your name")
    .action(createAction());
};
