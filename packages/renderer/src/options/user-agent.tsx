import type {AnyRemotionOption} from './option';

let userAgent: string | null = null;

const cliFlag = 'user-agent' as const;

export const userAgentOption = {
	name: 'User agent',
	cliFlag,
	description: () => (
		<>
			Lets you set a custom user agent that the headless Chrome browser assumes.
		</>
	),
	ssrName: 'userAgent' as const,
	docLink: 'https://www.remotion.dev/docs/chromium-flags#--user-agent',
	type: null as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		if (userAgent !== null) {
			return {
				source: 'config',
				value: userAgent,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value) => {
		userAgent = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
