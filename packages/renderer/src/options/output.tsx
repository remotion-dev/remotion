import type {AnyRemotionOption} from './option';

const cliFlag = 'output' as const;

export const outputOption = {
	name: 'Output location',
	cliFlag,
	description: () => (
		<>
			Where to save the output to. Can be a file path or a directory. If not
			specified, the output will be saved to the default location.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/render#--output',
	type: undefined as string | undefined,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		return {
			source: 'default',
			value: undefined,
		};
	},
	setConfig: () => {
		throw new Error('Cannot set output via config file. Use setOutputLocation()');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | undefined>;
