import type {AnyRemotionOption} from './option';

export type ChromeVersion = string | null;

const cliFlag = 'chrome-version' as const;

let configSelection: ChromeVersion = null;

export const chromeVersionOption = {
	cliFlag,
	name: 'Chrome Version',
	ssrName: 'chromeVersion',
	description: () => {
		return (
			<>
				Specify a custom Chrome version to download. Default is{' '}
				<code>null</code>, which uses the tested version bundled with Remotion.{' '}
				<a href="https://remotion.dev/docs/renderer/ensure-browser#chromeversion">
					See documentation for available versions.
				</a>
			</>
		);
	},
	docLink: 'https://www.remotion.dev/docs/renderer/ensure-browser#chromeversion',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as string,
				source: 'cli',
			};
		}

		if (configSelection !== null) {
			return {
				value: configSelection,
				source: 'config',
			};
		}

		return {
			value: null,
			source: 'default',
		};
	},
	setConfig: (newChromeVersion: ChromeVersion) => {
		configSelection = newChromeVersion;
	},
	type: null as ChromeVersion,
} satisfies AnyRemotionOption<ChromeVersion>;
