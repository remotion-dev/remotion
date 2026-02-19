import {validateDimension} from '../validate';
import type {AnyRemotionOption} from './option';

let currentHeight: number | null = null;

const cliFlag = 'height' as const;

export const overrideHeightOption = {
	name: 'Override Height',
	cliFlag,
	description: () => <>Overrides the height of the composition.</>,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#overrideheight',
	type: null as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as number;
			validateDimension(value, 'height', 'in --height flag');

			return {
				source: 'cli',
				value,
			};
		}

		if (currentHeight !== null) {
			return {
				source: 'config',
				value: currentHeight,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (height) => {
		validateDimension(height, 'height', 'in Config.overrideHeight()');
		currentHeight = height;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
