import type {AnyRemotionOption} from './option';

const DEFAULT = null;

const cliFlag = 'separate-audio-to';

export const separateAudioOption = {
	cliFlag,
	description: () =>
		`If set, the audio will not be included in the main output but rendered as a separate file at the location you pass. If the render contains no audio, a silent audio file is produced even when enforceAudioTrack is false. Audio-only renders, muted renders and codecs without audio support cannot use this option. For local renders, use an absolute path; relative paths are resolved against the Remotion Root. On Lambda, pass an output name or custom destination as described in renderMediaOnLambda().`,
	docLink: 'https://www.remotion.dev/docs/options/separate-audio-to',
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
	addedIn: '4.0.123',
	setConfig: () => {
		throw new Error('Not implemented');
	},
	ssrName: 'separateAudioTo',
	type: 'string' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
