import type {AnyRemotionOption} from './option';

const primaryFlag = 'quiet' as const;
const aliasFlag = 'q' as const;

let currentQuiet: boolean = false;

export const quietOption = {
	name: 'Quiet',
	cliFlag: primaryFlag,
	ssrName: 'quiet' as const,
	description: () => (
		<>Only prints the composition IDs, separated by a space.</>
	),
	docLink: 'https://www.remotion.dev/docs/cli/compositions#--quiet---q',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (
			commandLine[primaryFlag] !== undefined ||
			commandLine[aliasFlag] !== undefined
		) {
			return {value: true, source: 'cli'};
		}
		if (currentQuiet !== null) return {value: currentQuiet, source: 'config'};
		return {value: false, source: 'default'};
	},
	setConfig: (value: boolean) => {
		currentQuiet = value;
	},
	id: primaryFlag,
} satisfies AnyRemotionOption<boolean>;
