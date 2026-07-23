import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey} from 'remotion';
import type {BooleanMap} from './persist-boolean-map';

export const migrateExpandedTracksForSubscriptionKey = (
	prev: BooleanMap,
	oldKey: SequencePropsSubscriptionKey,
	newKey: SequencePropsSubscriptionKey,
): BooleanMap | null => {
	const oldPrefix = stringifySequenceExpandedRowKey(oldKey);
	const newPrefix = stringifySequenceExpandedRowKey(newKey);

	if (oldPrefix === newPrefix) {
		return null;
	}

	let changed = false;
	const next: BooleanMap = {...prev};

	for (const [key, value] of Object.entries(prev)) {
		if (value !== false || !key.startsWith(oldPrefix + '.')) {
			continue;
		}

		const migratedKey = newPrefix + key.slice(oldPrefix.length);
		if (next[migratedKey] === undefined) {
			next[migratedKey] = false;
		}

		delete next[key];
		changed = true;
	}

	return changed ? next : null;
};
