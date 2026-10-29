import type {AnyRemotionOption} from './option';

let configuredShowLayerFrameNumbers: boolean | null = null;

const cliFlag = 'show-layer-frame-numbers' as const;

export const showLayerFrameNumbersOption = {
	name: 'Show frame numbers of layer',
	addedIn: '4.0.535',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Show the current frame number inside sequence layers in the Studio
			timeline. Defaults to <code>false</code>.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/show-layer-frame-numbers',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {value: commandLine[cliFlag] as boolean, source: 'cli'};
		}

		return {value: configuredShowLayerFrameNumbers ?? false, source: 'config'};
	},
	setConfig(value) {
		if (typeof value !== 'boolean') {
			throw new Error('Config.setShowLayerFrameNumbers() expects a boolean');
		}

		configuredShowLayerFrameNumbers = value;
	},
	getConfigValue: () => configuredShowLayerFrameNumbers,
	reset: () => {
		configuredShowLayerFrameNumbers = null;
	},
} satisfies AnyRemotionOption<boolean>;
