import type {AnyRemotionOption} from './option';

const cliFlag = 'quiet' as const;

export const quietOption = {
	name: 'Quiet mode',
	cliFlag,
	description: () => (
		<>
			If set, Remotion will only print errors to the console. Also available as{' '}
			<code>-q</code>.
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
		throw new Error('Cannot set quiet mode via config file');
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
