import type {AnyRemotionOption} from './option';

let currentApiKey: string | null = null;

const cliFlag = 'api-key' as const;

export const apiKeyOption = {
	name: 'API key',
	cliFlag,
	description: () => (
		<>
			API key for sending a usage event using <code>@remotion/licensing</code>.
		</>
	),
	ssrName: 'apiKey' as const,
	docLink: 'https://www.remotion.dev/docs/licensing',
	type: null as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		return {
			source: 'default',
			value: currentApiKey,
		};
	},
	setConfig: (value: string | null) => {
		currentApiKey = value;
	},
} satisfies AnyRemotionOption<string | null>;
