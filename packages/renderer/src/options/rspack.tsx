import type {AnyRemotionOption} from './option';

let rspackEnabled = false;
let configuredRspackEnabled: boolean | null = null;

const cliFlag = 'rspack' as const;

export const rspackOption = {
	name: 'Rspack',
	cliFlag,
	description: () => (
		<>Uses Rspack instead of Webpack as the bundler for the Studio or bundle.</>
	),
	ssrName: null,
	docLink: null,
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: rspackEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		rspackEnabled = value;
		configuredRspackEnabled = value;
	},
	getConfigValue: () => configuredRspackEnabled,
	reset: () => {
		rspackEnabled = false;
		configuredRspackEnabled = null;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
