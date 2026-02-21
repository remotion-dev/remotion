import type {AnyRemotionOption} from './option';

const cliFlag = 'browser-args' as const;
let currentBrowserArgs: string = '';

export const browserArgsOption = {
	name: 'Browser Args',
	cliFlag,
	ssrName: 'browserArgs' as const,
	description: () => (
		<>A set of command line flags that should be passed to the browser.</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/studio#--browser-args',
	type: '' as string,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined)
			return {value: String(commandLine[cliFlag]), source: 'cli'};
		if (currentBrowserArgs !== null)
			return {value: currentBrowserArgs, source: 'config'};
		return {value: '', source: 'default'};
	},
	setConfig: (value: string) => {
		currentBrowserArgs = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string>;
