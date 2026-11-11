import type {AnyRemotionOption} from './option';

const cliFlag = 'public-license-key' as const;

let currentPublicLicenseKey: string | null = null;

export const publicLicenseKeyOption = {
	name: 'Public License Key',
	addedIn: '4.0.398',
	cliFlag,
	description: () => (
		<>
			The public license key for your company license, obtained from the License
			keys page for your project in the{' '}
			<a href="https://www.remotion.dev/dashboard">Remotion Dashboard</a>. If
			you are eligible for the free license, pass{' '}
			<code>&quot;free-license&quot;</code>.
		</>
	),
	ssrName: 'publicLicenseKey' as const,
	docLink: 'https://www.remotion.dev/docs/options/public-license-key',
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
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
