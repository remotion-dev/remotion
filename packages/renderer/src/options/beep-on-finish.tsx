import type {AnyRemotionOption} from './option';

let beepOnFinish = false;
let configuredBeepOnFinish: boolean | null = null;

const cliFlag = 'beep-on-finish' as const;

export const beepOnFinishOption = {
	name: 'Beep on finish',
	cliFlag,
	description: () => (
		<>
			Whether the Remotion Studio tab should beep when the render is finished.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setbeeponfinish',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		if (beepOnFinish !== false) {
			return {
				value: beepOnFinish,
				source: 'config',
			};
		}

		return {
			value: false,
			source: 'default',
		};
	},
	setConfig(value) {
		beepOnFinish = value;
		configuredBeepOnFinish = value;
	},
	getConfigValue: () => configuredBeepOnFinish,
	reset: () => {
		beepOnFinish = false;
		configuredBeepOnFinish = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
