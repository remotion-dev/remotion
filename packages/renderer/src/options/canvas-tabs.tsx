import type {AnyRemotionOption} from './option';

let canvasTabsEnabled = true;
let configuredCanvasTabsEnabled: boolean | null = null;

const cliFlag = 'disable-canvas-tabs' as const;

export const canvasTabsOption = {
	name: 'Disable or enable Studio canvas tabs',
	cliFlag,
	description: () => <>Enable or disable the tabs above the Studio canvas.</>,
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/disable-canvas-tabs',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			canvasTabsEnabled = commandLine[cliFlag] === false;
			return {
				value: canvasTabsEnabled,
				source: 'cli',
			};
		}

		return {
			value: canvasTabsEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		canvasTabsEnabled = value;
		configuredCanvasTabsEnabled = value;
	},
	getConfigValue: () => configuredCanvasTabsEnabled,
	reset: () => {
		canvasTabsEnabled = true;
		configuredCanvasTabsEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
