import type {AnyRemotionOption} from './option';

const cliFlag = 'quiet' as const;

let currentQuiet: boolean = false;

export const quietOption = {
	name: 'Quiet',
	cliFlag,
	ssrName: 'quiet' as const,
	description: () => (
		<>Only prints the composition IDs, separated by a space.</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/compositions#--quiet---q',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: true, source: 'cli'};
		}

		if (currentQuiet !== false) return {value: currentQuiet, source: 'config'};
		return {value: false, source: 'default'};
	},
	setConfig: (value: boolean) => {
		currentQuiet = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
