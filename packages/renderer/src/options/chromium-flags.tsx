import {validateChromiumOption} from '../validate-chromium-option';
import type {AnyRemotionOption} from './option';

let value: Record<string, string | boolean> = {};
const cliFlag = 'chromium-flags' as const;

export const chromiumFlagsOption = {
	name: 'Chromium flags',
	addedIn: '4.0.543',
	cliFlag,
	id: cliFlag,
	ssrName: 'flags' as const,
	docLink: 'https://www.remotion.dev/docs/options/chromium-flags',
	type: {} as Record<string, string | boolean>,
	description: (mode) => (
		<>
			Adds, replaces, or removes Chrome flags. Keys omit the leading --. true
			adds a bare flag, a string sets its value, and false removes it. Overrides
			take precedence over other Chromium options. The user-data-dir and
			remote-debugging-* flags are reserved. Defaults to <code>{'{}'}</code>.
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

			validateChromiumOption(parsed, 'flags');
			return {value: parsed as Record<string, string | boolean>, source: 'cli'};
		}

		return {
			value,
			source: Object.keys(value).length === 0 ? 'default' : 'config',
		};
	},
	setConfig: (newValue) => {
		validateChromiumOption(newValue, 'flags');
		value = {...newValue};
	},
	getConfigValue: () => value,
	reset: () => {
		value = {};
	},
} satisfies AnyRemotionOption<Record<string, string | boolean>>;
