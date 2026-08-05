import type {AnyRemotionOption} from './option';

const cliFlag = 'skip-skills' as const;

export const skipSkillsOption = {
	name: 'Skip Skills',
	cliFlag,
	description: () => (
		<>Do not update installed Remotion Agent Skills while upgrading Remotion.</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/upgrade#--skip-skills',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: true,
			};
		}

		return {
			source: 'default',
			value: false,
		};
	},
	setConfig: () => {
		throw new Error('Cannot skip updating skills via config file');
	},
	type: false as boolean,
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
