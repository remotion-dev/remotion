import {expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import {calculateTimeline} from '../calculate-timeline';

const makeSequence = ({
	id,
	parent,
	from,
	nonce,
}: {
	id: string;
	parent: string | null;
	from: number;
	nonce: number;
}): TSequence => ({
	controls: null,
	displayName: id,
	documentationLink: null,
	duration: 100,
	effects: [],
	effectRuntimeValues: null,
	from,
	frozenFrame: null,
	getStack: () => null,
	id,
	isInsideSeries: false,
	loopDisplay: undefined,
	nonce: [[0, nonce]],
	parent,
	postmountDisplay: null,
	premountDisplay: null,
	refForOutline: null,
	showInTimeline: true,
	trimBefore: null,
	type: 'sequence',
});

test('returns an empty timeline when there are no sequences', () => {
	expect(
		calculateTimeline({overrideIdsToNodePaths: {}, sequences: []}),
	).toEqual([]);
});

test('normalizes nesting and visible starts', () => {
	const timeline = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			makeSequence({id: 'child', parent: 'parent', from: -10, nonce: 1}),
			makeSequence({id: 'parent', parent: null, from: 20, nonce: 0}),
		],
	});

	expect(
		timeline.map(({depth, sequence, sequenceFrameOffset}) => ({
			depth,
			from: sequence.from,
			id: sequence.id,
			sequenceFrameOffset,
		})),
	).toEqual([
		{id: 'parent', depth: 0, from: 20, sequenceFrameOffset: 0},
		{id: 'child', depth: 1, from: 20, sequenceFrameOffset: 10},
	]);
});
