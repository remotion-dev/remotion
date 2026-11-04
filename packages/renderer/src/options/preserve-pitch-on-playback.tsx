import type {AnyRemotionOption} from './option';

let configuredPreservePitchOnPlayback: boolean | null = null;

const cliFlag = 'preserve-pitch-on-playback' as const;

export const preservePitchOnPlaybackOption = {
	name: 'Preserve pitch on playback',
	addedIn: '4.0.538',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Preserve audio pitch when changing the Studio playback speed. Defaults to{' '}
			<code>true</code>. Applies to <code>Audio</code> and <code>Video</code>{' '}
			from <code>@remotion/media</code>, independently of their clip-level{' '}
			<code>preservePitch</code> props. Does not affect rendered output or
			native media components, including native fallbacks. Set{' '}
			<code>--preserve-pitch-on-playback=false</code> to disable.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/preserve-pitch-on-playback',
	type: false as boolean,
	getValue: ({commandLine}) => {
		const value = commandLine[cliFlag];
		if (value !== undefined && value !== null) {
			if (typeof value !== 'boolean') {
				throw new Error('--preserve-pitch-on-playback expects a boolean');
			}

			return {value, source: 'cli'};
		}

		return {value: configuredPreservePitchOnPlayback ?? true, source: 'config'};
	},
	setConfig(value) {
		if (typeof value !== 'boolean') {
			throw new Error('Config.setPreservePitchOnPlayback() expects a boolean');
		}

		configuredPreservePitchOnPlayback = value;
	},
	getConfigValue: () => configuredPreservePitchOnPlayback,
	reset: () => {
		configuredPreservePitchOnPlayback = null;
	},
} satisfies AnyRemotionOption<boolean>;
