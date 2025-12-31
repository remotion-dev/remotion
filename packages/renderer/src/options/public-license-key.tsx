import type {AnyRemotionOption} from './option';

const cliFlag = 'public-license-key' as const;

let currentPublicLicenseKey: string | null = null;

export const publicLicenseKeyOption = {
	name: 'Public License Key',
	cliFlag,
	description: () => (
		<>
			The public license key for your company license, obtained from the "Usage"
			tab on <a href="https://remotion.pro/dashboard">remotion.pro</a>. If you
			are eligible for the free license, pass "free-license".
		</>
	),
	ssrName: 'publicLicenseKey' as const,
	docLink: 'https://www.remotion.dev/docs/licensing',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		if (currentPublicLicenseKey !== null) {
			return {
				source: 'config',
				value: currentPublicLicenseKey,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		if (value && value !== 'free-license' && !value.startsWith('rm_pub_')) {
			throw new Error(
				'Invalid public license key. It must start with "rm_pub_" or be "free-license".',
			);
		}

		currentPublicLicenseKey = value;
	},
	type: null as string | null,
} satisfies AnyRemotionOption<string | null>;
