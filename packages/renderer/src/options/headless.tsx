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
			see the render happen. This requires{' '}
			<a href="/docs/miscellaneous/chrome-headless-shell">Chrome for Testing</a>{' '}
			or a custom Chrome or Chromium executable. Chrome Headless Shell always
			runs headlessly. The default is headless mode.
		</>
	),
	ssrName: 'headless',
	docLink: 'https://www.remotion.dev/docs/chromium-flags#--disable-headless',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
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
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
