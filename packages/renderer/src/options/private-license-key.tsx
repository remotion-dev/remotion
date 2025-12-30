import type {AnyRemotionOption} from './option';

const cliFlag = 'private-license-key' as const;

let currentPrivateLicenseKey: string | null = null;

export const privateLicenseKeyOption = {
	name: 'Private License Key',
	cliFlag,
	description: () => (
		<>
			The private license key for your company license, obtained from the
			"Usage" tab on <a href="https://remotion.pro/dashboard">remotion.pro</a>.
			If you are eligible for the free license, pass "free-license".
		</>
	),
	ssrName: 'privateLicenseKey' as const,
	docLink: 'https://www.remotion.dev/docs/licensing',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		if (currentPrivateLicenseKey !== null) {
			return {
				source: 'config',
				value: currentPrivateLicenseKey,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		currentPrivateLicenseKey = value;
	},
	type: null as string | null,
} satisfies AnyRemotionOption<string | null>;
