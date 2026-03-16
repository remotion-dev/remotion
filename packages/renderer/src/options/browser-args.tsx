import type {AnyRemotionOption} from './option';

const cliFlag = 'browser-args' as const;

export const browserArgsOption = {
	name: 'Browser arguments',
	cliFlag,
	description: () => (
		<>
			A JSON array of additional Chromium CLI flags to pass when launching the
			browser. Example: <code>--browser-args=&quot;[&quot;--disable-gpu&quot;]&quot;</code>
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/render#--browser-args',
	type: null as string | null,
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
			'Cannot set browser args via config file. Use chromiumOptions.args instead.',
		);
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
