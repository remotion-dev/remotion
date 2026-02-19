import {validateDurationInFrames} from '../validate';
import type {AnyRemotionOption} from './option';

let currentDuration: number | null = null;

const cliFlag = 'duration' as const;

export const overrideDurationOption = {
	name: 'Override Duration',
	cliFlag,
	description: () => <>Overrides the duration in frames of the composition.</>,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#overrideduration',
	type: null as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as number;
			validateDurationInFrames(value, {
				component: 'in --duration flag',
				allowFloats: false,
			});

			return {
				source: 'cli',
				value,
			};
		}

		if (currentDuration !== null) {
			return {
				source: 'config',
				value: currentDuration,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (duration) => {
		validateDurationInFrames(duration, {
			component: 'in Config.overrideDuration()',
			allowFloats: false,
		});
		currentDuration = duration;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
