import type {AnyRemotionOption} from './option';

let askAIEnabled = true;
let configuredAskAIEnabled: boolean | null = null;

const cliFlag = 'disable-ask-ai' as const;

export const askAIOption = {
	name: 'Disable or Enable the Ask AI option',
	addedIn: '4.0.407',
	cliFlag,
	description: () => (
		<>
			The Ask AI feature, opened with the Cmd + I shortcut, is enabled by
			default in the Studio. This option disables it, for example if the
			shortcut conflicts with your setup.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/disable-ask-ai',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			askAIEnabled = false;
			return {
				value: askAIEnabled,
				source: 'cli',
			};
		}

		return {
			value: askAIEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		askAIEnabled = value;
		configuredAskAIEnabled = value;
	},
	getConfigValue: () => configuredAskAIEnabled,
	reset: () => {
		askAIEnabled = true;
		configuredAskAIEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
