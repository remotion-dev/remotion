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
		{
			files: ['*.md', '*.mdx'],
			options: {
				useTabs: false,
				printWidth: 300,
			},
		},
	],
	plugins: [
		require.resolve('@remotion/typescript-tools/prettier-organize-imports'),
	],
};
