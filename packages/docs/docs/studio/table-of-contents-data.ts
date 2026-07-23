export const studioTableOfContents = [
	{
		link: '/docs/studio/get-static-files',
		label: 'getStaticFiles()',
		description: 'Get a list of files in the `public` folder',
	},
	{
		link: '/docs/studio/watch-public-folder',
		label: 'watchPublicFolder()',
		description: 'Listen to changes in the public folder',
	},
	{
		link: '/docs/studio/watch-static-file',
		label: 'watchStaticFile()',
		description: 'Listen to changes of a static file',
	},
	{
		link: '/docs/studio/write-static-file',
		label: 'writeStaticFile()',
		description: 'Save content to a file in the public directory',
	},
	{
		link: '/docs/studio/save-default-props',
		label: 'saveDefaultProps()',
		description: 'Save default props to the root file',
	},
	{
		link: '/docs/studio/update-default-props',
		label: 'updateDefaultProps()',
		description: 'Update default props in the Props editor',
	},
	{
		link: '/docs/studio/delete-static-file',
		label: 'deleteStaticFile()',
		description: 'Delete a file from the public directory',
	},
	{
		link: '/docs/studio/restart-studio',
		label: 'restartStudio()',
		description: 'Restart the Studio Server.',
	},
	{
		link: '/docs/studio/play',
		label: 'play()',
		description: 'Start playback in the timeline',
	},
	{
		link: '/docs/studio/pause',
		label: 'pause()',
		description: 'Pause playback in the timeline',
	},
	{
		link: '/docs/studio/toggle',
		label: 'toggle()',
		description: 'Toggle playback in the timeline',
	},
	{
		link: '/docs/studio/seek',
		label: 'seek()',
		description: 'Jump to a position in the timeline',
	},
	{
		link: '/docs/studio/go-to-composition',
		label: 'goToComposition()',
		description: 'Select a composition in the composition selector',
	},
	{
		link: '/docs/studio/focus-default-props-path',
		label: 'focusDefaultPropsPath()',
		description: 'Scrolls to a specific field in the default props editor',
	},
	{
		link: '/docs/studio/reevaluate-composition',
		label: 'reevaluateComposition()',
		description: 'Re-runs calculateMetadata() on the current composition',
	},
	{
		link: '/docs/studio/visual-control',
		label: 'visualControl()',
		description: 'Create a control in the right sidebar of the Studio',
	},
] as const;
