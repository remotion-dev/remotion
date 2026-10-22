import type {AnyRemotionOption} from './option';

const cliFlag = 'env-file' as const;

let envFileLocation: string | null = null;

export const envFileOption = {
	name: 'Env File',
	addedIn: '2.2.0',
	cliFlag,
	description: () => (
		<>
			Specify a location for a dotenv file. Default <code>.env</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/env-file',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		if (envFileLocation !== null) {
			return {
				source: 'config',
				value: envFileLocation,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		envFileLocation = value;
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
