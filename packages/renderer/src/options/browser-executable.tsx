import type {BrowserExecutable} from '../browser-executable';
import type {AnyRemotionOption} from './option';

let currentBrowserExecutablePath: BrowserExecutable = null;

const cliFlag = 'browser-executable' as const;

export const browserExecutableOption = {
	name: 'Browser executable',
	addedIn: '1.5.0',
	cliFlag,
	description: () => (
		<>
			Set a custom Chrome or Chromium executable path. By default, Remotion
			downloads and uses Chrome Headless Shell with Remotion&apos;s browser
			fixes. Leave this option unset for normal rendering.
		</>
	),
	ssrName: 'browserExecutable' as const,
	docLink: 'https://www.remotion.dev/docs/options/browser-executable',
	type: null as BrowserExecutable,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as BrowserExecutable,
			};
		}

		if (currentBrowserExecutablePath !== null) {
			return {
				source: 'config',
				value: currentBrowserExecutablePath,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value) => {
		currentBrowserExecutablePath = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<BrowserExecutable>;
