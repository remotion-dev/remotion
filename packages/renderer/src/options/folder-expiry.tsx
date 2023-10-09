import type {AnyRemotionOption} from './option';

export const folderExpiryOption = {
	name: 'Lambda render expiration',
	cliFlag: 'enable-folder-expiry' as const,
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
} satisfies AnyRemotionOption;
