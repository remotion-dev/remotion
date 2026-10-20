import type {AnyRemotionOption} from './option';

let shouldOverwrite: boolean | null = null;
const cliFlag = 'overwrite' as const;

const validate = (value: unknown) => {
	if (typeof value !== 'boolean') {
		throw new Error(
			`overwriteExisting must be a boolean but got ${typeof value} (${value})`,
		);
	}
};

export const overwriteOption = {
	name: 'Overwrite output',
	addedIn: '1.0.0',
	cliFlag,
	description: () => (
		<>
			If set to <code>false</code>, will prevent rendering to a path that
			already exists. Default is <code>true</code>.
		</>
	),
	ssrName: 'overwrite',
	docLink: 'https://www.remotion.dev/docs/options/overwrite',
	type: false as boolean,
	getValue: ({commandLine}, defaultValue: boolean) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			validate(commandLine[cliFlag]);

			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean,
			};
		}

		if (shouldOverwrite !== null) {
			return {
				source: 'config',
				value: shouldOverwrite,
			};
		}

		return {
			source: 'default',
			value: defaultValue,
		};
	},
	setConfig: (value) => {
		validate(value);
		shouldOverwrite = value;
	},
	reset: () => {
		shouldOverwrite = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
