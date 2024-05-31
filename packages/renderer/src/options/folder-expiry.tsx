import type {AnyRemotionOption} from './option';

let enableFolderExpiry: boolean | null = null;

const cliFlag = 'enable-folder-expiry' as const;

export const folderExpiryOption = {
	name: 'Lambda render expiration',
	cliFlag,
	description: () => {
		return (
			<>
				When deploying sites, enable or disable S3 Lifecycle policies which
				allow for renders to auto-delete after a certain time. Default is{' '}
				<code>null</code>, which does not change any lifecycle policies of the
				S3 bucket. See: <a href="/docs/lambda/autodelete">Lambda autodelete</a>.
			</>
		);
	},
	ssrName: 'enableFolderExpiry' as const,
	docLink: 'https://www.remotion.dev/docs/lambda/autodelete',
	type: false as boolean | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean | null,
			};
		}

		if (enableFolderExpiry !== null) {
			return {
				source: 'config',
				value: enableFolderExpiry,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: boolean | null) => {
		enableFolderExpiry = value;
	},
} satisfies AnyRemotionOption<boolean | null>;
