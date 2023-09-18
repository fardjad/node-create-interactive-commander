module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:unicorn/recommended", "xo", "prettier"],
  ignorePatterns: ["coverage"],
  rules: {},
  overrides: [
    {
      files: ["*.ts", "*.cts", "*.mts", "*.d.ts"],
      extends: [
        "plugin:unicorn/recommended",
        "xo",
        "xo-typescript",
        "prettier",
      ],
      plugins: ["@typescript-eslint"],
      rules: {
        "unicorn/no-process-exit": "off",
        "@typescript-eslint/no-throw-literal": "off",
      },
    },
  ],
};
