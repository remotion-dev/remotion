import type {AnyRemotionOption} from './option';

const DEFAULT_MUTED_STATE = false;

let mutedState = DEFAULT_MUTED_STATE;

const cliFlag = 'muted' as const;

export const mutedOption = {
	name: 'Muted',
	cliFlag,
	description: () => <>The Audio of the video will be omitted.</>,
	ssrName: 'muted',
	docLink: 'https://www.remotion.dev/docs/using-audio/#muted-property',
	type: false as boolean,
	getValue: ({commandLine}) => {
		// we set in minimist `muted` default as null
		if (commandLine[cliFlag] !== null) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean,
			};
		}

		if (mutedState !== DEFAULT_MUTED_STATE) {
			return {
				source: 'config',
				value: mutedState,
			};
		}

		return {
			source: 'config',
			value: mutedState,
		};
	},
	setConfig: () => {
		mutedState = true;
	},
} satisfies AnyRemotionOption<boolean>;
