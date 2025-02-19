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
	cliFlag,
	description: () => (
		<>
			If set to <code>false</code>, will prevent rendering to a path that
			already exists. Default is <code>true</code>.
		</>
	),
	ssrName: 'overwrite',
	docLink: 'https://www.remotion.dev/docs/config#setoverwriteoutput',
	type: false as boolean,
	getValue: ({commandLine}, defaultValue: boolean) => {
		if (commandLine[cliFlag] !== undefined) {
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
} satisfies AnyRemotionOption<boolean>;
