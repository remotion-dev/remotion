import type {BrowserExecutable} from '../browser-executable';
import type {AnyRemotionOption} from './option';

let currentBrowserExecutablePath: BrowserExecutable = null;

const cliFlag = 'browser-executable' as const;

export const browserExecutableOption = {
	name: 'Browser executable',
	cliFlag,
	description: () => (
		<>
			Set a custom Chrome or Chromium executable path. By default Remotion will
			try to find an existing version of Chrome on your system and if not found,
			it will download one. This flag is useful if you don&apos;t have Chrome
			installed in a standard location and you want to prevent downloading an
			additional browser or need support for the H264 codec.
		</>
	),
	ssrName: 'browserExecutable' as const,
	docLink: 'https://www.remotion.dev/docs/config#setbrowserexecutable',
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
