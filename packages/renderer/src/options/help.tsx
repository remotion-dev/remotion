import type {AnyRemotionOption} from './option';

const cliFlag = 'help' as const;

export const helpOption = {
	name: 'Help',
	cliFlag,
	description: () => (
		<>
			Prints the list of available CLI commands and options.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean,
			};
		}

		return {
			source: 'default',
			value: false,
		};
	},
	setConfig: () => {
		throw new Error('Cannot set help flag via config file');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
