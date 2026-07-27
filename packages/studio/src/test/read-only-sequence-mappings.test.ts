import {expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import {getReadOnlyOverrideIdToNodePathMappings} from '../components/SequencePropsSubscriptionProvider';

test('read-only sequences get stable non-writable selection identities', () => {
	const mappings = getReadOnlyOverrideIdToNodePathMappings([
		{
			controls: {overrideId: 'first'},
		} as TSequence,
		{
			controls: null,
		} as TSequence,
	]);

	expect(mappings).toEqual({
		first: {
			absolutePath: '',
			effectKeys: [],
			nodePath: ['readonly-sequence', 'first'],
			sequenceKeys: [],
			videoConfigValues: null,
		},
	});
});
