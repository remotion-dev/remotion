import {expect, test} from 'bun:test';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {findTrackForNodePathInfo} from '../components/Timeline/find-track-for-node-path-info';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const getStack = () => null;

const makeSequenceSubscriptionKey = (
	effectKeys: string[][],
): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	nodePath: ['body', 0],
	sequenceKeys: ['from', 'durationInFrames'],
	effectKeys,
});

const makeNodePathInfo = (effectKeys: string[][]): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: makeSequenceSubscriptionKey(effectKeys),
	auxiliaryKeys: [],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
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

test('finds a track even if effect keys changed after a source edit', () => {
	const currentNodePath = makeSequenceSubscriptionKey([
		['oldEffect'],
		['newEffect'],
	]);

	const track = findTrackForNodePathInfo({
		sequences: [makeSequence()],
		overrideIdsToNodePaths: {
			override: currentNodePath,
		},
		nodePathInfo: makeNodePathInfo([['oldEffect']]),
	});

	expect(track?.nodePathInfo?.sequenceSubscriptionKey).toBe(currentNodePath);
});
