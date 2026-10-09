import type {AnyRemotionOption} from './option';

let experimentalTracksEnabled = false;
let configuredExperimentalTracksEnabled: boolean | null = null;

const cliFlag = 'experimental-tracks' as const;

export const experimentalTracksOption = {
	name: 'Enable experimental timeline tracks',
	addedIn: '4.0.534',
	cliFlag,
	description: () => (
		<>
			Enable experimental timeline tracks in the Remotion Studio. Group clips
			from <code>{'<Track>'}</code>, <code>{'<Series>'}</code> and{' '}
			<code>{'<TransitionSeries>'}</code> on shared rows, with overlays on
			additional rows. Disabled by default.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/experimental-tracks',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: experimentalTracksEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		experimentalTracksEnabled = value;
		configuredExperimentalTracksEnabled = value;
	},
	getConfigValue: () => configuredExperimentalTracksEnabled,
	reset: () => {
		experimentalTracksEnabled = false;
		configuredExperimentalTracksEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
