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
	sequencePlaybackRate: 1,
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

test('retimed nested tracks use composition geometry and local media clocks', () => {
	const outer: TSequence = {
		...makeSequence({id: 'outer', parent: null, from: 10}),
		sequencePlaybackRate: 1.5,
		trimBefore: 6,
	};
	const inner: TSequence = {
		...makeSequence({id: 'inner', parent: 'outer', from: 30}),
		sequencePlaybackRate: 2,
		duration: 60,
		trimBefore: 8,
	};
	const video: TSequence = {
		...makeSequence({id: 'video', parent: 'inner', from: 0}),
		type: 'video',
		duration: 180,
		src: 'video.mp4',
		playbackRate: 0.5,
		mediaFrameAtSequenceZero: 5,
		startMediaFrom: 5,
		frozenMediaFrame: null,
		muted: false,
		doesVolumeChange: true,
		// Registration already samples volume at composition-frame cadence.
		volume: '0,0.3,0.6',
		loopDisplay: {durationInFrames: 30, startOffset: -30, numberOfTimes: 3},
	};
	const tracks = calculateTimeline({
		sequences: [outer, inner, video],
		overrideIdsToNodePaths: {},
	});
	const childTrack = tracks.find((track) => track.sequence.id === 'inner')!;
	const mediaTrack = tracks.find((track) => track.sequence.id === 'video')!;
	expect(childTrack.sequence.from).toBe(26);
	expect(childTrack.sequence.duration).toBe(40);
	expect(childTrack.sequence.sequencePlaybackRate).toBe(3);
	expect(childTrack.sequenceFrameOffset).toBeCloseTo(8);
	expect(childTrack.keyframePlaybackRate).toBe(1.5);
	expect(mediaTrack.sequence.from).toBe(26);
	expect(mediaTrack.sequence.duration).toBe(40);
	expect(mediaTrack.sequenceFrameOffset).toBeCloseTo(8);
	expect(mediaTrack.sequence.loopDisplay).toEqual({
		durationInFrames: 10,
		startOffset: -10,
		numberOfTimes: 3,
	});
	if (mediaTrack.sequence.type !== 'video') throw new Error('Expected video');
	expect(
		mediaTrack.sequence.playbackRate * mediaTrack.sequence.sequencePlaybackRate,
	).toBe(1.5);
	expect(mediaTrack.sequence.volume).toBe('0,0.3,0.6');
});
