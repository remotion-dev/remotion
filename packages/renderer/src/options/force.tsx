import type {AnyRemotionOption} from './option';

const cliFlag = 'force' as const;

export const forceOption = {
	name: 'Force',
	cliFlag,
	ssrName: 'force' as const,
	description: () => <></>,
	docLink: null,
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: Boolean(commandLine[cliFlag]), source: 'cli'};
		}
		return {
			source: 'default',
			value: false,
		};
	},
	setConfig: () => {},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
