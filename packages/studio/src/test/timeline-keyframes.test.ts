import {expect, test} from 'bun:test';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {getTimelineKeyframes} from '../components/Timeline/get-timeline-keyframes';
import {calculateTimeline} from '../helpers/calculate-timeline';

const getStack = () => null;

const makeNodePath = (id: string): SequencePropsSubscriptionKey => ({
	absolutePath: '/src/Composition.tsx',
	nodePath: [id],
	sequenceKeys: ['style.scale'],
	effectKeys: [],
});

const makeControls = (
	overrideId: string,
): NonNullable<TSequence['controls']> => ({
	schema: {},
	currentRuntimeValueDotNotation: {},
	overrideId,
});

const makeSequence = ({
	id,
	from,
	parent = null,
	overrideId = null,
	nonce,
}: {
	id: string;
	from: number;
	parent?: string | null;
	overrideId?: string | null;
	nonce: number;
}): TSequence => ({
	type: 'sequence',
	from,
	duration: 120,
	id,
	displayName: id,
	documentationLink: null,
	parent,
	rootId: 'root',
	showInTimeline: true,
	nonce: [[0, nonce]],
	loopDisplay: undefined,
	getStack,
	refForOutline: null,
	premountDisplay: null,
	postmountDisplay: null,
	controls: overrideId ? makeControls(overrideId) : null,
	effects: [],
});

test('keyframe display offsets follow the parent sequence context', () => {
	const timeline = calculateTimeline({
		sequences: [
			makeSequence({
				id: 'root-style',
				from: 30,
				overrideId: 'root-style',
				nonce: 0,
			}),
			makeSequence({id: 'parent', from: 30, nonce: 1}),
			makeSequence({
				id: 'child',
				from: 0,
				parent: 'parent',
				overrideId: 'child',
				nonce: 2,
			}),
			makeSequence({id: 'outer', from: 10, nonce: 3}),
			makeSequence({
				id: 'own-from',
				from: 20,
				parent: 'outer',
				overrideId: 'own-from',
				nonce: 4,
			}),
			makeSequence({
				id: 'grandchild',
				from: 0,
				parent: 'own-from',
				overrideId: 'grandchild',
				nonce: 5,
			}),
		],
		overrideIdsToNodePaths: {
			'root-style': makeNodePath('root-style'),
			child: makeNodePath('child'),
			'own-from': makeNodePath('own-from'),
			grandchild: makeNodePath('grandchild'),
		},
	});

	const getOffset = (id: string): number => {
		const track = timeline.find((t) => t.sequence.id === id);
		if (!track) {
			throw new Error(`Could not find track ${id}`);
		}

		return track.keyframeDisplayOffset;
	};

	expect(getOffset('root-style')).toBe(0);
	expect(getOffset('child')).toBe(30);
	expect(getOffset('own-from')).toBe(10);
	expect(getOffset('grandchild')).toBe(30);
	expect(
		timeline.find((t) => t.sequence.id === 'parent')?.keyframeDisplayOffset,
	).toBe(0);

	expect(
		getTimelineKeyframes(
			{
				canUpdate: false,
				reason: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 2},
					{frame: 60, value: 4},
				],
				easing: ['linear'],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
			getOffset('child'),
		),
	).toEqual([
		{frame: 30, value: 2},
		{frame: 90, value: 4},
	]);
});
