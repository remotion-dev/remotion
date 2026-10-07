import {NoReactInternals} from 'remotion/no-react';
import type {AnyRemotionOption} from './option';

let configuredDefaultPremountInSeconds: number | null = null;
const cliFlag = 'default-premount-in-seconds' as const;

export const defaultPremountInSecondsOption = {
	name: 'Default premount duration in seconds',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Set the default premount duration in seconds for timed components in the
			Studio. Defaults to 0 in v4 and 2 in v5. Must be a finite, non-negative
			number. The duration is converted to frames using the composition FPS and
			rounded to the nearest frame. An explicit <code>premountFor</code> prop
			takes precedence. Does not affect rendering. In the Player, use the{' '}
			<code>defaultPremountInSeconds</code> prop instead.
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
				NoReactInternals.DEFAULT_PREMOUNT_IN_SECONDS,
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
