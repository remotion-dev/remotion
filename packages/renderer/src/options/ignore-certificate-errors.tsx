import type {AnyRemotionOption} from './option';

let ignoreCertificateErrors = false;

const cliFlag = 'ignore-certificate-errors' as const;

export const ignoreCertificateErrorsOption = {
	name: 'Ignore certificate errors',
	cliFlag,
	description: () => (
		<>
			Results in invalid SSL certificates in Chrome, such as self-signed ones,
			being ignored.
		</>
	),
	ssrName: 'ignoreCertificateErrors' as const,
	docLink:
		'https://www.remotion.dev/docs/chromium-flags#--ignore-certificate-errors',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: Boolean(commandLine[cliFlag]),
			};
		}

		if (ignoreCertificateErrors) {
			return {
				source: 'config',
				value: ignoreCertificateErrors,
			};
		}

		return {
			source: 'default',
			value: false,
		};
	},
	setConfig: (value) => {
		ignoreCertificateErrors = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
