import {NoReactInternals} from 'remotion/no-react';
import type {AnyRemotionOption} from './option';

let configuredLimit: number | null = null;
const cliFlag = 'sequence-activity-limit' as const;

export const sequenceActivityLimitOption = {
	name: 'Sequence Activity limit',
	addedIn: '4.0.536',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Limit hidden scenes discovered by Sequence Activity in the Remotion
			Studio, including nested sequences and their ancestors. Visible,
			premounted, and postmounted scenes always render. Defaults to{' '}
			<code>Infinity</code> for unlimited discovery without admission delays.
			Must be a non-negative safe integer or <code>Infinity</code>. Set to 0 to
			disable Sequence Activity. Finite limits prioritize nearby scenes. Does
			not affect rendering.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/options/sequence-activity-limit',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value =
				commandLine[cliFlag] === 'Infinity' ? Infinity : commandLine[cliFlag];
			if (
				value !== Infinity &&
				(!Number.isSafeInteger(value) || (value as number) < 0)
			) {
				throw new Error(
					'Sequence Activity limit must be a non-negative safe integer or Infinity.',
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
		if (value !== Infinity && (!Number.isSafeInteger(value) || value < 0)) {
			throw new Error(
				'Sequence Activity limit must be a non-negative safe integer or Infinity.',
			);
		}

		configuredLimit = value;
	},
	getConfigValue: () => configuredLimit,
	reset: () => {
		configuredLimit = null;
	},
} satisfies AnyRemotionOption<number>;
