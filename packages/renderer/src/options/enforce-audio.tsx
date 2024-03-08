import type {AnyRemotionOption} from './option';

const DEFAULT_ENFORCE_AUDIO_TRACK = false;

let enforceAudioTrackState = DEFAULT_ENFORCE_AUDIO_TRACK;

const cliFlag = 'enforce-audio-track' as const;

export const enforceAudioOption = {
	name: 'Enforce Audio Track',
	cliFlag,
	description: () => (
		<>Render a silent audio track if there would be none otherwise.</>
	),
	ssrName: 'enforceAudioTrack',
	docLink: 'https://www.remotion.dev/docs/config#setenforceaudiotrack-',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: true,
			};
		}

		if (enforceAudioTrackState !== DEFAULT_ENFORCE_AUDIO_TRACK) {
			return {
				source: 'config',
				value: enforceAudioTrackState,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_ENFORCE_AUDIO_TRACK,
		};
	},
	setConfig: (value) => {
		enforceAudioTrackState = value;
	},
} satisfies AnyRemotionOption<boolean>;
