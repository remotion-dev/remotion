module.exports = {
	singleQuote: false,
	bracketSpacing: true,
	useTabs: false,
	tabWidth: 2,
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
