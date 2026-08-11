import type {AnyRemotionOption} from './option';

const cliFlag = 'config' as const;

export const configOption = {
	name: 'Config file',
	cliFlag,
	description: () => <>Specify a location for the Remotion config file.</>,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: () => {
		throw new Error(
			'setConfig is not supported. Pass --config via the CLI instead.',
		);
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
