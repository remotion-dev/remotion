import type {AnyRemotionOption} from './option';

const cliFlag = 'browser' as const;

export const browserOption = {
	name: 'Browser',
	cliFlag,
	description: () => (
		<>
			Specify the browser which should be used for opening a tab. The default
			browser will be used by default. Pass an absolute path or{' '}
			<code>&quot;chrome&quot;</code> to use Chrome. If Chrome is selected as
			the browser and you are on macOS, Remotion will try to reuse an existing
			tab.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/studio#--browser',
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
			'setBrowser is not supported. Pass --browser via the CLI instead.',
		);
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
