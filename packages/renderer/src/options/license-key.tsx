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
			<code>@remotion/licensing</code>. For server-side rendering, including{' '}
			<code>renderMedia()</code> and <code>renderStill()</code>, and CLI
			renders, pass your private license key starting with <code>rm_sec_</code>.
			For client-side rendering with <code>@remotion/web-renderer</code>, pass
			your public license key starting with <code>rm_pub_</code>. You can find
			both keys on the License keys page on{' '}
			<a href="https://www.remotion.pro/dashboard">remotion.pro</a>. If you{' '}
			<a href="https://www.remotion.dev/docs/license">
				qualify for the free license
			</a>
			, pass <code>"free-license"</code> instead.
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
