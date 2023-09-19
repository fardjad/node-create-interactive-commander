import { createAction, register } from "./index.ts";
import { InteractiveCommand } from "interactive-commander";
import assert from "node:assert";
import { test } from "node:test";

await test("action", (t) => {
  const log = t.mock.fn();
  const action = createAction(log);

  action({ name: "world" });

  assert.strictEqual(log.mock.calls.length, 1);
  assert.deepStrictEqual(log.mock.calls[0].arguments, ["Hello world!"]);
});

await test("command", async (t) => {
  const rootCommand = new InteractiveCommand();
  await register(rootCommand);

  await t.test("hello", async () => {
    const helloCommand = rootCommand.commands.find((c) => c.name() === "hello");
    assert.ok(helloCommand);

    const nameOption = helloCommand.options.find(
      (o) => o.attributeName() === "name",
    );
    assert.ok(nameOption);
    assert.strictEqual(nameOption.flags, "-n, --name <name>");
    assert.strictEqual(nameOption.description, "your name");
    assert.strictEqual(nameOption.required, true);
  });
});
