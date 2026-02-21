import type {AnyRemotionOption} from './option';

const cliFlag = 'help' as const;

let currentHelp: boolean | null = null;

export const helpOption = {
	name: 'Help',
	cliFlag,
	ssrName: 'help' as const,
	description: () => (
		<>Prints available commands and flags for the Remotion CLI.</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/help',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: Boolean(commandLine[cliFlag]), source: 'cli'};
		}
		if (currentHelp !== null) return {value: currentHelp, source: 'config'};
		return {value: false, source: 'default'};
	},
	setConfig: (value: boolean) => {
		currentHelp = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
