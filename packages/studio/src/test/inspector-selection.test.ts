import {expect, test} from 'bun:test';
import type {SequenceNodePath, SequencePropsSubscriptionKey} from 'remotion';
import {getSameSequenceInspectorSelection} from '../components/InspectorPanel/inspector-selection';
import type {TimelineSelection} from '../components/Timeline/TimelineSelection';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const makeKey = (nodePath: SequenceNodePath): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	effectKeys: [],
	nodePath,
	sequenceKeys: ['from', 'durationInFrames'],
	videoConfigValues: null,
});

const makeNodePathInfo = (
	nodePath: SequenceNodePath,
	auxiliaryKeys: string[],
): SequenceNodePathInfo => ({
	auxiliaryKeys,
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	sequenceSubscriptionKey: makeKey(nodePath),
	supportsEffects: true,
});

test('keeps the sequence inspector for multiple effects from the same sequence', () => {
	const firstEffect: TimelineSelection = {
		i: 0,
		nodePathInfo: makeNodePathInfo(['Root', 'Child'], ['effects', '0']),
		type: 'sequence-effect',
	};
	const secondEffect: TimelineSelection = {
		i: 1,
		nodePathInfo: makeNodePathInfo(['Root', 'Child'], ['effects', '1']),
		type: 'sequence-effect',
	};

	expect(getSameSequenceInspectorSelection([firstEffect, secondEffect])).toBe(
		firstEffect,
	);
});

test('does not keep the sequence inspector for effects from different sequences', () => {
	const firstEffect: TimelineSelection = {
		i: 0,
		nodePathInfo: makeNodePathInfo(['Root', 'First'], ['effects', '0']),
		type: 'sequence-effect',
	};
	const secondEffect: TimelineSelection = {
		i: 0,
		nodePathInfo: makeNodePathInfo(['Root', 'Second'], ['effects', '0']),
		type: 'sequence-effect',
	};

	expect(getSameSequenceInspectorSelection([firstEffect, secondEffect])).toBe(
		null,
	);
});
