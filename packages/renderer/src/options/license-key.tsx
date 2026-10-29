import type {AnyRemotionOption} from './option';

let currentLicenseKey: string | null = null;

const cliFlag = 'license-key' as const;

export const licenseKeyOption = {
	name: 'License key',
	addedIn: '4.0.409',
	cliFlag,
	description: () => (
		<>
			License key for sending a usage event using{' '}
			<code>@remotion/licensing</code>. For <code>npx remotion render</code> and{' '}
			<code>npx remotion still</code>, pass a private API key starting with{' '}
			<code>rm_sec_</code> from the License keys page on{' '}
			<a href="https://www.remotion.pro/dashboard">remotion.pro</a>.
		</>
	),
	ssrName: 'licenseKey' as const,
	docLink: 'https://www.remotion.dev/docs/options/license-key',
	type: null as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		return {
			source: 'default',
			value: currentLicenseKey,
		};
	},
	setConfig: (value: string | null) => {
		currentLicenseKey = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
