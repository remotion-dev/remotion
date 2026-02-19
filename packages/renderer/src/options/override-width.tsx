import {validateDimension} from '../validate';
import type {AnyRemotionOption} from './option';

let currentWidth: number | null = null;

const cliFlag = 'width' as const;

export const overrideWidthOption = {
	name: 'Override Width',
	cliFlag,
	description: () => <>Overrides the width of the composition.</>,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#overridewidth',
	type: null as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as number;
			validateDimension(value, 'width', 'in --width flag');

			return {
				source: 'cli',
				value,
			};
		}

		if (currentWidth !== null) {
			return {
				source: 'config',
				value: currentWidth,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (width) => {
		validateDimension(width, 'width', 'in Config.overrideWidth()');
		currentWidth = width;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
