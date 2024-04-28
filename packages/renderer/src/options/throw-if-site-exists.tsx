import type {AnyRemotionOption} from './option';

const DEFAULT = false;

const cliFlag = 'throw-if-site-exists';

export const throwIfSiteExistsOption = {
	cliFlag,
	description: () =>
		`Prevents accidential update of an existing site. If there are any files in the subfolder where the site should be placed, the function will throw.`,
	docLink: 'https://remotion.dev/docs/lambda/deploy-site',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean,
			};
		}

		return {
			source: 'default',
			value: DEFAULT,
		};
	},
	name: 'Throw if site exists',
	setConfig: () => {
		throw new Error('Not implemented');
	},
	ssrName: 'throwIfSiteExists',
	type: false as boolean,
} satisfies AnyRemotionOption<boolean>;
