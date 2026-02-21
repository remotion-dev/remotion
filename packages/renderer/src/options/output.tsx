import type {AnyRemotionOption} from './option';

const cliFlag = 'output' as const;

let currentOutput: string | undefined = undefined;

// Option for --output
export const outputOption = {
	name: 'Output',
	cliFlag,
	ssrName: 'output' as const,
	description: () => (
		<>
			Sets the output file path, as an alternative to the{' '}
			<code>output-location</code> positional argument.
		</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/render#--output-',
	type: '' as string | undefined,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as string,
				source: 'cli',
			};
		}

		if (currentOutput !== undefined) {
			return {
				value: currentOutput,
				source: 'config',
			};
		}

		return {
			source: 'default',
			value: undefined,
		};
	},
	setConfig: (value: string | undefined) => {
		currentOutput = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | undefined>;
