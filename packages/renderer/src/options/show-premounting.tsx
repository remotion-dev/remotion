import type {AnyRemotionOption} from './option';

let configuredShowPremounting: boolean | null = null;

const cliFlag = 'show-premounting' as const;

export const showPremountingOption = {
	name: 'Show premounting in the Studio timeline',
	addedIn: '4.0.535',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Show premounting indicators in the Studio timeline. Defaults to{' '}
			<code>true</code>; this may change in a future 4.x release. Set explicitly
			to preserve your preference.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/show-premounting',
	type: true as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {value: commandLine[cliFlag] as boolean, source: 'cli'};
		}

		return {value: configuredShowPremounting ?? true, source: 'config'};
	},
	setConfig(value) {
		if (typeof value !== 'boolean') {
			throw new Error('Config.setShowPremounting() expects a boolean');
		}

		configuredShowPremounting = value;
	},
	getConfigValue: () => configuredShowPremounting,
	reset: () => {
		configuredShowPremounting = null;
	},
} satisfies AnyRemotionOption<boolean>;
