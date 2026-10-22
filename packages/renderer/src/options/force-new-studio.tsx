import type {AnyRemotionOption} from './option';

let forceNewEnabled = false;

const cliFlag = 'force-new' as const;

export const forceNewStudioOption = {
	name: 'Force New Studio',
	addedIn: '4.0.421',
	cliFlag,
	description: () => (
		<>
			Forces starting a new Studio instance even if one is already running on
			the same port for the same project.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/force-new',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: forceNewEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		forceNewEnabled = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
