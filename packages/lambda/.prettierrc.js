module.exports = {
	singleQuote: true,
	bracketSpacing: false,
	jsxBracketSameLine: false,
	plugins: [require.resolve('prettier-plugin-organize-imports')],
	useTabs: true,
	overrides: [
		{
			files: ['*.yml'],
			options: {
				singleQuote: false,
			},
		},
	],
};
