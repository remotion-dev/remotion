import type {AnyRemotionOption} from './option';

let experimentalKeepAudioContextAlive = false;

const cliFlag = 'experimental-keep-audio-context-alive' as const;

export const experimentalKeepAudioContextAliveOption = {
	name: 'Keep AudioContext alive (experimental)',
	cliFlag,
	description: () => (
		<>
			Keeps the shared <code>AudioContext</code> running while the Remotion
			Studio is paused.
		</>
	),
	ssrName: null,
	docLink:
		'https://www.remotion.dev/docs/config#setexperimentalkeepaudiocontextalive',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: experimentalKeepAudioContextAlive,
			source: 'config',
		};
	},
	setConfig(value) {
		experimentalKeepAudioContextAlive = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
