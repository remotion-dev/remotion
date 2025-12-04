import type {AnyRemotionOption} from './option';

const DEFAULT_VALUE = false;

let darkMode = DEFAULT_VALUE;

const cliFlag = 'dark-mode' as const;

export const darkModeOption = {
	name: 'Dark Mode',
	cliFlag,
	description: () => (
		<>
			Whether Chromium should pretend to be in dark mode by emulating the media
			feature 'prefers-color-scheme: dark'. Default is{' '}
			<code>{String(DEFAULT_VALUE)}</code>.
		</>
	),
	ssrName: 'darkMode',
	docLink: 'https://www.remotion.dev/docs/chromium-flags#--dark-mode',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean,
			};
		}

		if (darkMode !== DEFAULT_VALUE) {
			return {
				source: 'config',
				value: darkMode,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_VALUE,
		};
	},
	setConfig: (value: boolean) => {
		darkMode = value;
	},
} satisfies AnyRemotionOption<boolean>;
