import type {AnyRemotionOption} from './option';

let forceNewEnabled = false;

const cliFlag = 'force-new' as const;

export const forceNewOption = {
	name: 'Force New Studio',
	cliFlag,
	description: () => (
		<>
			Forces starting a new Studio instance even if one is already running on
			the same port for the same project.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setforcenewenabled',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: forceNewEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		forceNewEnabled = value;
	},
} satisfies AnyRemotionOption<boolean>;
