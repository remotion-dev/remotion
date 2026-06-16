import {expect, test} from 'bun:test';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {findTrackForInspectorSelection} from '../components/InspectorPanel/find-track-for-inspector-selection';

const getStack = () => null;

const makeSequenceSubscriptionKey = (
	effectKeys: string[][],
): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	nodePath: ['body', 0],
	sequenceKeys: ['from', 'durationInFrames'],
	effectKeys,
});

const makeSequence = (): TSequence => ({
	displayName: 'Sequence',
	documentationLink: null,
	duration: 100,
	from: 0,
	id: 'sequence',
	parent: null,
	rootId: 'sequence',
	showInTimeline: true,
	type: 'sequence',
	nonce: [[0, 0]],
	getStack,
	refForOutline: null,
	isInsideSeries: false,
	premountDisplay: null,
	postmountDisplay: null,
	controls: {
		schema: {},
		currentRuntimeValueDotNotation: {},
		overrideId: 'override',
		supportsEffects: true,
		componentIdentity: null,
	},
	loopDisplay: undefined,
	effects: [],
	frozenFrame: null,
});

test('inspector resolves a selected sequence after effect keys changed', () => {
	const currentNodePath = makeSequenceSubscriptionKey([
		['oldEffect'],
		['newEffect'],
	]);

	const track = findTrackForInspectorSelection({
		sequences: [makeSequence()],
		overrideIdsToNodePaths: {
			override: currentNodePath,
		},
		selection: {
			type: 'sequence',
			nodePathInfo: {
				sequenceSubscriptionKey: makeSequenceSubscriptionKey([['oldEffect']]),
				auxiliaryKeys: [],
				index: 0,
				numberOfSequencesWithThisNodePath: 1,
				supportsEffects: true,
			},
		},
	});

	expect(track?.nodePathInfo?.sequenceSubscriptionKey).toBe(currentNodePath);
});
