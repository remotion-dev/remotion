import type {AnyRemotionOption} from './option';

const cliFlag = 'version' as const;

export const versionFlagOption = {
	name: 'Version',
	cliFlag,
	description: () => (
		<>
			Install a specific version. Also enables downgrading to an older version.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/upgrade#--version',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: String(commandLine[cliFlag]),
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: () => {
		throw new Error('Cannot set version via config file');
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
