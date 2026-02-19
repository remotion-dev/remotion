import type {AnyRemotionOption} from './option';

let disableWebSecurity = false;

const cliFlag = 'disable-web-security' as const;

export const disableWebSecurityOption = {
	name: 'Disable web security',
	cliFlag,
	description: () => (
		<>
			This will most notably disable CORS in Chrome among other security
			features.
		</>
	),
	ssrName: 'disableWebSecurity' as const,
	docLink:
		'https://www.remotion.dev/docs/chromium-flags#--disable-web-security',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: Boolean(commandLine[cliFlag]),
			};
		}

		if (disableWebSecurity) {
			return {
				source: 'config',
				value: disableWebSecurity,
			};
		}

		return {
			source: 'default',
			value: false,
		};
	},
	setConfig: (value) => {
		disableWebSecurity = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
