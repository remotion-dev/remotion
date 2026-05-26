import {expect, test} from 'bun:test';
import {calculateTimeline} from '../helpers/calculate-timeline';

const getStack = () => null;

const withoutKeyframeDisplayOffset = <
	T extends {keyframeDisplayOffset: number},
>(
	tracks: T[],
) =>
	tracks.map(({keyframeDisplayOffset, ...track}) => {
		expect(keyframeDisplayOffset).toBe(0);
		return track;
	});

test('Should calculate timeline with no sequences', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [],
	});
	expect(calculated).toEqual([]);
});

test('Should calculate a basic timeline', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			{
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
			},
		],
	});
	expect(withoutKeyframeDisplayOffset(calculated)).toEqual([
		{
			nodePathInfo: null,
			depth: 0,
			sequence: {
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				getStack,
				type: 'sequence',
				nonce: [[0, 0]],
				effects: [],
			},
			hash: '-Audio-100-0-sequence----0',
		},
	]);
});

test('Should follow order of nesting', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			{
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
			},
			{
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: '0.1',
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				effects: [],
			},
		],
	});
	expect(withoutKeyframeDisplayOffset(calculated)).toEqual([
		{
			nodePathInfo: null,
			sequence: {
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: '0.1',
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				effects: [],
			},
			depth: 0,
			hash: '-Audio-100-0-sequence----0',
		},
		{
			nodePathInfo: null,
			sequence: {
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
			},
			depth: 1,
			hash: '-Audio-100-0-sequence----0-Audio-100-0-sequence----0',
		},
	]);
});

test('Should inherit loop display from parent for media tracks', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			{
				effects: [],
				displayName: 'Loop',
				documentationLink: null,
				duration: 100,
				from: 50,
				id: 'loop',
				parent: null,
				rootId: 'root',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: {
					durationInFrames: 100,
					numberOfTimes: 3,
					startOffset: -50,
				},
			},
			{
				displayName: 'video.mp4',
				documentationLink: null,
				duration: 100,
				from: 0,
				id: 'video',
				parent: 'loop',
				rootId: 'root',
				showInTimeline: true,
				type: 'video',
				nonce: [[0, 1]],
				getStack,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				src: 'video.mp4',
				volume: 1,
				doesVolumeChange: false,
				startMediaFrom: 0,
				playbackRate: 1,
				effects: [],
			},
		],
	});

	expect(calculated[1].sequence.loopDisplay).toEqual({
		durationInFrames: 100,
		numberOfTimes: 3,
		startOffset: -50,
	});
});
