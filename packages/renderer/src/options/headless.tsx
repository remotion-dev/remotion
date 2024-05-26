import type {AnyRemotionOption} from './option';

const DEFAULT = true;
let headlessMode = DEFAULT;

const cliFlag = 'disable-headless' as const;

export const headlessOption = {
	name: 'Disable Headless Mode',
	cliFlag,
	description: () => (
		<>
			If disabled, the render will open an actual Chrome window where you can
			see the render happen. The default is headless mode.
		</>
	),
	ssrName: 'headless',
	docLink: 'https://www.remotion.dev/docs/chromium-flags#--disable-headless',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: !commandLine[cliFlag],
			};
		}

		if (headlessMode !== DEFAULT) {
			return {
				source: 'config',
				value: headlessMode,
			};
		}

		return {
			source: 'default',
			value: headlessMode,
		};
	},
	setConfig: (value) => {
		headlessMode = value;
	},
} satisfies AnyRemotionOption<boolean>;
