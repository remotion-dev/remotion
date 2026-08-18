import type {AnyRemotionOption} from './option';

let keyboardShortcutsEnabled = true;
let configuredKeyboardShortcutsEnabled: boolean | null = null;

const cliFlag = 'disable-keyboard-shortcuts' as const;

export const keyboardShortcutsOption = {
	name: 'Disable or Enable keyboard shortcuts',
	cliFlag,
	description: () => (
		<>Enable or disable keyboard shortcuts in the Remotion Studio.</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setkeyboardshortcutsenabled',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			keyboardShortcutsEnabled = commandLine[cliFlag] === false;
			return {
				value: keyboardShortcutsEnabled,
				source: 'cli',
			};
		}

		return {
			value: keyboardShortcutsEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		keyboardShortcutsEnabled = value;
		configuredKeyboardShortcutsEnabled = value;
	},
	getConfigValue: () => configuredKeyboardShortcutsEnabled,
	reset: () => {
		keyboardShortcutsEnabled = true;
		configuredKeyboardShortcutsEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
