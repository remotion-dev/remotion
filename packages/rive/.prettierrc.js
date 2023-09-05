module.exports = {
  singleQuote: true,
  bracketSpacing: false,
  useTabs: true,
  overrides: [
    {
      files: ["*.yml"],
      options: {
        singleQuote: false,
      },
    },
  ],
  plugins: [require.resolve("prettier-plugin-organize-imports")],
};
