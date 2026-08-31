import {expect, test} from 'bun:test';
import type {LoopDisplay, TSequence} from 'remotion';
import {getTimelineMatchingDuration} from '../components/Timeline/get-timeline-matching-duration';
import {calculateTimeline} from '../helpers/calculate-timeline';

const makeSequence = ({
	duration,
	from,
	id,
	loopDisplay = undefined,
	parent = null,
	showInTimeline = true,
	unclippedDuration,
}: {
	readonly duration: number;
	readonly from: number;
	readonly id: string;
	readonly loopDisplay?: LoopDisplay;
	readonly parent?: string | null;
	readonly showInTimeline?: boolean;
	readonly unclippedDuration?: number;
}): TSequence => ({
	controls: null,
	displayName: id,
	documentationLink: null,
	duration,
	effects: [],
	effectRuntimeValues: null,
	from,
	frozenFrame: null,
	getStack: () => null,
	id,
	isInsideSeries: false,
	loopDisplay,
	nonce: [[0, 0]],
	parent,
	postmountDisplay: null,
	premountDisplay: null,
	refForOutline: null,
	showInTimeline,
	trimBefore: null,
	type: 'sequence',
	unclippedDuration,
});

const getMatchingDuration = (sequences: TSequence[]) =>
	getTimelineMatchingDuration({
		currentDuration: 300,
		timeline: calculateTimeline({
			sequences,
			overrideIdsToNodePaths: {},
		}),
	});

test('matches the last finite timeline layer using unclipped nested timing', () => {
	expect(
		getMatchingDuration([
			makeSequence({
				duration: 50,
				from: 250,
				id: 'clipped-by-composition',
				unclippedDuration: 100,
			}),
		]),
	).toBe(350);

	expect(
		getMatchingDuration([
			makeSequence({
				duration: 80,
				from: 20,
				id: 'parent',
				unclippedDuration: 80,
			}),
			makeSequence({
				duration: 20,
				from: 60,
				id: 'child',
				parent: 'parent',
				unclippedDuration: 100,
			}),
		]),
	).toBe(100);

	expect(
		getMatchingDuration([
			makeSequence({
				duration: 80,
				from: -20,
				id: 'negative-start',
				unclippedDuration: 100.5,
			}),
		]),
	).toBe(81);
});

test('ignores hidden, unbounded, and currently invisible layers', () => {
	expect(
		getMatchingDuration([
			makeSequence({
				duration: 100,
				from: 0,
				id: 'finite',
				unclippedDuration: 150,
			}),
			makeSequence({
				duration: 300,
				from: 0,
				id: 'unbounded',
				unclippedDuration: Infinity,
			}),
			makeSequence({
				duration: 300,
				from: 0,
				id: 'hidden',
				showInTimeline: false,
				unclippedDuration: 500,
			}),
			makeSequence({
				duration: 0,
				from: 350,
				id: 'after-composition',
				unclippedDuration: 100,
			}),
		]),
	).toBe(150);

	expect(
		getMatchingDuration([
			makeSequence({
				duration: 300,
				from: 0,
				id: 'unbounded',
				unclippedDuration: Infinity,
			}),
		]),
	).toBeNull();
});

test('uses the stable start of finite loops and ignores infinite repetitions', () => {
	expect(
		getMatchingDuration([
			makeSequence({
				duration: 10,
				from: 20,
				id: 'finite-loop',
				loopDisplay: {
					durationInFrames: 10,
					numberOfTimes: 3,
					startOffset: -20,
				},
				unclippedDuration: 50,
			}),
		]),
	).toBe(50);

	expect(
		getMatchingDuration([
			makeSequence({
				duration: 10,
				from: 20,
				id: 'infinite-loop',
				loopDisplay: {
					durationInFrames: 10,
					numberOfTimes: 30,
					startOffset: -20,
				},
				unclippedDuration: Infinity,
			}),
			makeSequence({
				duration: 10,
				from: 0,
				id: 'repeated-child',
				parent: 'infinite-loop',
				unclippedDuration: 10,
			}),
			makeSequence({
				duration: 5,
				from: 0,
				id: 'repeated-grandchild',
				parent: 'repeated-child',
				unclippedDuration: 5,
			}),
		]),
	).toBeNull();
});
