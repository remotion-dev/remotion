import type {AnyRemotionOption} from './option';

let configuredHighContrast: boolean | null = null;

const cliFlag = 'high-contrast' as const;

export const highContrastOption = {
	name: 'High contrast in Remotion Studio',
	addedIn: '4.0.542',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Increase the contrast of text, focus indicators, and panel dividers in
			Remotion Studio. Defaults to <code>false</code>. You can toggle it in
			Settings → Studio → Interface while Studio is running.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/high-contrast',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {value: commandLine[cliFlag] as boolean, source: 'cli' as const};
		}

		return {value: configuredHighContrast ?? false, source: 'config' as const};
	},
	setConfig(value) {
		if (typeof value !== 'boolean') {
			throw new Error('Config.setHighContrast() expects a boolean');
		}

		configuredHighContrast = value;
	},
	getConfigValue: () => configuredHighContrast,
	reset: () => {
		configuredHighContrast = null;
	},
} satisfies AnyRemotionOption<boolean>;
