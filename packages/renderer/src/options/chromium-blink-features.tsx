import {validateChromiumOption} from '../validate-chromium-option';
import type {AnyRemotionOption} from './option';

let value: Record<string, boolean> = {};
const cliFlag = 'chromium-blink-features' as const;

export const chromiumBlinkFeaturesOption = {
	name: 'Chromium Blink features',
	addedIn: '4.0.543',
	cliFlag,
	id: cliFlag,
	ssrName: 'blinkFeatures' as const,
	docLink: 'https://www.remotion.dev/docs/options/chromium-blink-features',
	type: {} as Record<string, boolean>,
	description: (mode) => (
		<>
			Overrides individual Blink features. true enables a feature and removes it
			from the disabled list; false disables it and removes it from the enabled
			list. Unspecified features retain their defaults. Applied after raw flag
			overrides. Defaults to <code>{'{}'}</code>.
			{mode === 'cli' ? ' Pass a JSON object.' : null} Remotion’s default Chrome
			flags and enabled or disabled features may change between patch versions.
			There is no guarantee that these defaults remain unchanged.
		</>
	),
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			let parsed: unknown;
			try {
				parsed = JSON.parse(commandLine[cliFlag] as string);
			} catch {
				throw new TypeError(`--${cliFlag} must be a valid JSON object.`);
			}

			validateChromiumOption(parsed, 'blinkFeatures');
			return {value: parsed as Record<string, boolean>, source: 'cli'};
		}

		return {
			value,
			source: Object.keys(value).length === 0 ? 'default' : 'config',
		};
	},
	setConfig: (newValue) => {
		validateChromiumOption(newValue, 'blinkFeatures');
		value = {...newValue};
	},
	getConfigValue: () => value,
	reset: () => {
		value = {};
	},
} satisfies AnyRemotionOption<Record<string, boolean>>;
