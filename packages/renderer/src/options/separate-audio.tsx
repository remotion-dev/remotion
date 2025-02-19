import type {AnyRemotionOption} from './option';

const DEFAULT = null;

const cliFlag = 'separate-audio-to';

export const separateAudioOption = {
	cliFlag,
	description: () =>
		`If set, the audio will not be included in the main output but rendered as a separate file at the location you pass. It is recommended to use an absolute path. If a relative path is passed, it is relative to the Remotion Root.`,
	docLink: 'https://remotion.dev/docs/renderer/render-media',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		return {
			source: 'default',
			value: DEFAULT,
		};
	},
	name: 'Separate audio to',
	setConfig: () => {
		throw new Error('Not implemented');
	},
	ssrName: 'separateAudioTo',
	type: 'string' as string | null,
} satisfies AnyRemotionOption<string | null>;
