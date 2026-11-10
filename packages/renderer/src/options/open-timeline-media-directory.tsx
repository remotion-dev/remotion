import type {AnyRemotionOption} from './option';

const cliFlag = 'media-dir' as const;

export const openTimelineMediaDirectoryOption = {
	name: 'OpenTimeline media directory',
	addedIn: '4.0.543',
	cliFlag,
	description: () => (
		<>
			Directory containing the media referenced by an OpenTimelineIO file.
			Defaults to the directory containing the timeline. Missing absolute paths
			are also looked up by filename in this directory.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/media-dir',
	getValue: ({commandLine}) => {
		const value = commandLine[cliFlag];
		if (value === undefined) {
			return {source: 'default', value: null};
		}

		if (typeof value !== 'string' || !value) {
			throw new Error('--media-dir must be a directory path.');
		}

		return {source: 'cli', value};
	},
	setConfig: () => {
		throw new Error(
			'The OpenTimeline media directory can only be set through --media-dir.',
		);
	},
	type: null as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
