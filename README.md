# create-interactive-commander

Scaffold a CLI project with [interactive-commander][1] and TypeScript

<div class="paragraph">

<span class="image"><a href="https://www.npmjs.com/package/create-interactive-commander" class="image"><img src="https://img.shields.io/npm/v/create-interactive-commander" alt="NPM Version" /></a></span> <span class="image"><a href="https://www.npmjs.com/package/create-interactive-commander" class="image"><img src="https://img.shields.io/npm/dm/create-interactive-commander" alt="Monthly Downloads" /></a></span> <span class="image"><a href="https://github.com/fardjad/node-create-interactive-commander/actions" class="image"><img src="https://img.shields.io/github/actions/workflow/status/fardjad/node-create-interactive-commander/test-and-release.yml?branch=main" alt="test-and-release Workflow Status" /></a></span>

</div>

## Usage

Run the following command and follow the prompts:

```bash
npm create interactive-commander@latest
```

You can also directly specify the template variables via command line arguments.
For example to create a project in the `my-project` directory with the package
name set to `node-my-command` and the command name set to `my-command`, run:

```bash
npm create interactive-commander@latest -- --directory-name my-project --package-name node-my-command --command-name my-command
```

For more information, run:

```bash
npm create interactive-commander@latest -- generate --help
```

[1]: https://github.com/fardjad/node-interactive-commander
