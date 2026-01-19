import type {AnyRemotionOption} from './option';

let askAIEnabled = true;

const cliFlag = 'disable-ask-ai' as const;

export const askAIOption = {
	name: 'Disable or Enable the Ask AI option',
	cliFlag,
	description: () => (
		<>
			If the Cmd + I shortcut of the Ask AI modal conflicts with your Studio,
			you can disable it using this.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setaskaienabled',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
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
	},
} satisfies AnyRemotionOption<boolean>;
