import type {AnyRemotionOption} from './option';

const cliFlag = 'png' as const;

export const pngOption = {
	name: 'PNG (deprecated)',
	cliFlag,
	description: () => (
		<>
			<strong>Deprecated.</strong> Use <code>--sequence --image-format=png</code>{' '}
			instead.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/render',
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
		throw new Error(
			'The --png flag has been removed. Use --sequence --image-format=png from now on.',
		);
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
