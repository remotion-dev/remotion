import {NoReactInternals} from 'remotion/no-react';
import type {AnyRemotionOption} from './option';

let configuredDefaultPremountInSeconds: number | null = null;
const cliFlag = 'default-premount-in-seconds' as const;

export const defaultPremountInSecondsOption = {
	name: 'Default premount duration in seconds',
	addedIn: '4.0.535',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Set the default premount duration in seconds for timed components in the
			Studio. Defaults to 2. Before v4.0.535, there was no premounting by
			default.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/default-premount-in-seconds',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag];
			NoReactInternals.validateDefaultPremountInSeconds(value);
			return {value: value as number, source: 'cli'};
		}

		return {
			value:
				configuredDefaultPremountInSeconds ??
				NoReactInternals.DEFAULT_STUDIO_PREMOUNT_IN_SECONDS,
			source: 'config',
		};
	},
	setConfig(value) {
		NoReactInternals.validateDefaultPremountInSeconds(value);
		configuredDefaultPremountInSeconds = value;
	},
	getConfigValue: () => configuredDefaultPremountInSeconds,
	reset: () => {
		configuredDefaultPremountInSeconds = null;
	},
} satisfies AnyRemotionOption<number>;
