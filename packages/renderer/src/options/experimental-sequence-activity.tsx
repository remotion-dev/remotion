import type {AnyRemotionOption} from './option';

let experimentalSequenceActivityEnabled = false;
let configuredExperimentalSequenceActivityEnabled: boolean | null = null;

const cliFlag = 'experimental-sequence-activity' as const;

export const experimentalSequenceActivityOption = {
	name: 'Enable experimental Sequence Activity',
	addedIn: '4.0.535',
	cliFlag,
	description: () => (
		<>
			Discover layers in nearby hidden scenes in the Remotion Studio before they
			become visible. This experimental feature may use more CPU. Disabled by
			default. Does not affect rendering.
		</>
	),
	ssrName: null,
	docLink:
		'https://www.remotion.dev/docs/options/experimental-sequence-activity',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: experimentalSequenceActivityEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		experimentalSequenceActivityEnabled = value;
		configuredExperimentalSequenceActivityEnabled = value;
	},
	getConfigValue: () => configuredExperimentalSequenceActivityEnabled,
	reset: () => {
		experimentalSequenceActivityEnabled = false;
		configuredExperimentalSequenceActivityEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
