import {validateFps} from '../validate';
import type {AnyRemotionOption} from './option';

let currentFps: number | null = null;

const cliFlag = 'fps' as const;

export const overrideFpsOption = {
	name: 'Override FPS',
	cliFlag,
	description: () => <>Overrides the frames per second of the composition.</>,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#overridefps',
	type: null as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as number;
			validateFps(value, 'in --fps flag', false);

			return {
				source: 'cli',
				value,
			};
		}

		if (currentFps !== null) {
			return {
				source: 'config',
				value: currentFps,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (fps) => {
		validateFps(fps, 'in Config.overrideFps()', false);
		currentFps = fps;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
