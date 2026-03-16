import type {AnyRemotionOption} from './option';

const cliFlag = 'force' as const;

export const forceOption = {
	name: 'Force',
	cliFlag,
	description: () => (
		<>
			Force the render to proceed even if there are warnings.
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
		throw new Error('Cannot set force flag via config file');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
