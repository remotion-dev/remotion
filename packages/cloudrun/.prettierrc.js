module.exports = {
	singleQuote: true,
	bracketSpacing: false,
	useTabs: true,
	overrides: [
		{
			files: ['*.yml'],
			options: {
				singleQuote: false,
			},
		},
	],
	overrides: [
		{
			files: ['container/cloudbuild.json'],
			options: {
				useTabs: false,
			},
		},
	],
	plugins: [require.resolve('prettier-plugin-organize-imports')],
};
