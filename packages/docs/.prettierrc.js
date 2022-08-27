module.exports = {
	singleQuote: false,
	bracketSpacing: true,
	useTabs: true,
	overrides: [
		{
			files: ['*.yml'],
			options: {
				singleQuote: false,
			},
		},
	],
	plugins: [require.resolve('prettier-plugin-organize-imports')],
};
