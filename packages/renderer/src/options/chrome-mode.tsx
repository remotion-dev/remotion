import type {AnyRemotionOption} from './option';

export const validChromeModeOptions = [
	'headless-shell',
	'chrome-for-testing',
] as const;

export type ChromeMode = (typeof validChromeModeOptions)[number];

const cliFlag = 'chrome-mode' as const;

let configSelection: ChromeMode | null = null;

export const chromeModeOption = {
	cliFlag,
	name: 'Chrome Mode',
	ssrName: 'chromeMode',
	description: () => {
		return (
			<>
				One of{' '}
				{validChromeModeOptions.map((option, i) => (
					<code key={option}>
						{option}
						{i === validChromeModeOptions.length - 1 ? '' : ', '}
					</code>
				))}
				. Default <code>headless-shell</code>.{' '}
				<a href="https://remotion.dev/docs/miscellaneous/chrome-headless-shell">
					Use <code>chrome-for-testing</code> to take advantage of GPU drivers
					on Linux.
				</a>
			</>
		);
	},
	docLink: 'https://www.remotion.dev/chrome-for-testing',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			if (
				!validChromeModeOptions.includes(commandLine[cliFlag] as ChromeMode)
			) {
				throw new Error(
					`Invalid \`--${cliFlag}\` value passed. Accepted values: ${validChromeModeOptions
						.map((l) => `'${l}'`)
						.join(', ')}.`,
				);
			}

			return {
				value: commandLine[cliFlag] as ChromeMode,
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
			value: 'headless-shell',
			source: 'default',
		};
	},
	setConfig: (newChromeMode: ChromeMode) => {
		configSelection = newChromeMode;
	},
	type: 'headless-shell' as ChromeMode,
} satisfies AnyRemotionOption<ChromeMode>;
