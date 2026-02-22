import type {AnyRemotionOption} from './option';

const cliFlag = 'q' as const;

let currentQuiet: boolean = false;

export const qOption = {
	name: 'Quiet Alias',
	cliFlag,
	ssrName: 'q' as const,
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
