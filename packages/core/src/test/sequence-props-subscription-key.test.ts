import {expect, test} from 'bun:test';
import type {SequencePropsSubscriptionKey} from '../SequenceManager.js';
import {makeSequencePropsSubscriptionKey} from '../SequenceManager.js';

const makeKey = (absolutePath: string): SequencePropsSubscriptionKey => ({
	absolutePath,
	nodePath: ['program', 'body', 0, 'openingElement'],
	sequenceKeys: ['name', 'from'],
	effectKeys: [],
	videoConfigValues: null,
});

test('sequence prop subscription keys include the absolute file path', () => {
	const first = makeSequencePropsSubscriptionKey(makeKey('/project/first.tsx'));
	const second = makeSequencePropsSubscriptionKey(
		makeKey('/project/second.tsx'),
	);

	expect(first).not.toBe(second);
});
