import type {AnyRemotionOption} from './option';

let interactivityEnabled = true;
let configuredInteractivityEnabled: boolean | null = null;

const cliFlag = 'disable-interactivity' as const;

export const interactivityOption = {
	name: 'Disable or enable Studio interactivity',
	cliFlag,
	description: () => (
		<>
			Enable or disable interactive editing in the Remotion Studio. When
			disabled, the Studio keeps previewing and source navigation available, but
			disables preview outlines, the sequence inspector, visual controls,
			timeline selection and timeline editing gestures.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setinteractivityenabled',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			interactivityEnabled = commandLine[cliFlag] === false;
			return {
				value: interactivityEnabled,
				source: 'cli',
			};
		}

		return {
			value: interactivityEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		interactivityEnabled = value;
		configuredInteractivityEnabled = value;
	},
	getConfigValue: () => configuredInteractivityEnabled,
	reset: () => {
		interactivityEnabled = true;
		configuredInteractivityEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
