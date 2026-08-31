import {expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import {calculateTimeline} from '../calculate-timeline';

const makeSequence = ({
	id,
	parent,
	from,
}: {
	id: string;
	parent: string | null;
	from: number;
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
	parent,
	postmountDisplay: null,
	premountDisplay: null,
	refForOutline: null,
	showInTimeline: true,
	timelineOrder: null,
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
			makeSequence({id: 'child', parent: 'parent', from: -10}),
			makeSequence({id: 'parent', parent: null, from: 20}),
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

test('committed Fiber order takes precedence over internal order', () => {
	const right = makeSequence({
		id: 'right',
		parent: null,
		from: 10,
	});
	const left = makeSequence({
		id: 'left',
		parent: null,
		from: 0,
	});
	right.timelineOrder = 1;
	left.timelineOrder = 0;

	const timeline = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [right, left],
	});

	expect(timeline.map((track) => track.sequence.id)).toEqual(['left', 'right']);
});
