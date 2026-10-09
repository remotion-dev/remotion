import {NoReactInternals} from 'remotion/no-react';
import type {AnyRemotionOption} from './option';

let configuredLimit: number | null = null;
const cliFlag = 'experimental-sequence-activity-limit' as const;

export const experimentalSequenceActivityLimitOption = {
	name: 'Experimental hidden Sequence Activity limit',
	addedIn: '4.0.535',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Limit nearby hidden scenes discovered by experimental Sequence Activity in
			the Remotion Studio, including nested sequences and their ancestors.
			Visible, premounted, and postmounted scenes always render. Defaults to 20.
			Must be a non-negative safe integer. Set to 0 to disable hidden discovery.
			Only applies when experimental Sequence Activity is enabled. Does not
			affect rendering.
		</>
	),
	ssrName: null,
	docLink:
		'https://www.remotion.dev/docs/options/experimental-sequence-activity-limit',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag];
			if (!Number.isSafeInteger(value) || (value as number) < 0) {
				throw new Error(
					'Sequence Activity limit must be a non-negative safe integer.',
				);
			}

			return {value: value as number, source: 'cli'};
		}

		return {
			value:
				configuredLimit ?? NoReactInternals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT,
			source: 'config',
		};
	},
	setConfig(value) {
		if (!Number.isSafeInteger(value) || value < 0) {
			throw new Error(
				'Sequence Activity limit must be a non-negative safe integer.',
			);
		}

		configuredLimit = value;
	},
	getConfigValue: () => configuredLimit,
	reset: () => {
		configuredLimit = null;
	},
} satisfies AnyRemotionOption<number>;
