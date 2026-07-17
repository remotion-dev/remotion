import {expect, test} from 'bun:test';
import {getTimelineMediaStartFrame} from '../components/Timeline/get-timeline-media-start-frame';
import {calculateTimeline} from '../helpers/calculate-timeline';

const getStack = () => null;

const withoutKeyframeDisplayOffset = <
	T extends {keyframeDisplayOffset: number; sequenceFrameOffset: number},
>(
	tracks: T[],
) =>
	tracks.map(({keyframeDisplayOffset, sequenceFrameOffset, ...track}) => {
		expect(keyframeDisplayOffset).toBe(0);
		expect(sequenceFrameOffset).toBe(0);
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
				trimBefore: null,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
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
				trimBefore: null,
				id: '0.1',
				parent: null,
				rootId: '0.1',
				showInTimeline: true,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				type: 'sequence',
				nonce: [[0, 0]],
				effects: [],
				frozenFrame: null,
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
				trimBefore: null,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
			},
			{
				displayName: 'Audio',
				documentationLink: null,
				duration: 100,
				from: 0,
				trimBefore: null,
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
				refForOutline: null,
				isInsideSeries: false,
				effects: [],
				frozenFrame: null,
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
				trimBefore: null,
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
				refForOutline: null,
				isInsideSeries: false,
				effects: [],
				frozenFrame: null,
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
				trimBefore: null,
				id: '0.2',
				parent: '0.1',
				rootId: '0.1',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
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
				frozenFrame: null,
				displayName: 'Loop',
				documentationLink: null,
				duration: 100,
				from: 50,
				trimBefore: null,
				id: 'loop',
				parent: null,
				rootId: 'root',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
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
				trimBefore: null,
				id: 'video',
				parent: 'loop',
				rootId: 'root',
				showInTimeline: true,
				type: 'video',
				nonce: [[0, 1]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				src: 'video.mp4',
				volume: 1,
				doesVolumeChange: false,
				startMediaFrom: 0,
				playbackRate: 1,
				frozenMediaFrame: null,
				mediaFrameAtSequenceZero: null,
				effects: [],
				frozenFrame: null,
			},
		],
	});

	expect(calculated[1].sequence.loopDisplay).toEqual({
		durationInFrames: 100,
		numberOfTimes: 3,
		startOffset: -50,
	});
});

test('Should calculate sequence frame offset for negative from values', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			{
				displayName: 'Trimmed',
				documentationLink: null,
				duration: 137,
				from: -37,
				trimBefore: null,
				id: 'trimmed',
				parent: null,
				rootId: 'trimmed',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
			},
		],
	});

	expect(calculated[0].sequence.from).toBe(0);
	expect(calculated[0].sequenceFrameOffset).toBe(37);
});

test('Should calculate sequence frame offset for trimBefore values', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			{
				displayName: 'Trimmed',
				documentationLink: null,
				duration: 120,
				from: 0,
				trimBefore: 20,
				id: 'trimmed',
				parent: null,
				rootId: 'trimmed',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
			},
		],
	});

	expect(calculated[0].sequence.from).toBe(0);
	expect(calculated[0].sequenceFrameOffset).toBe(20);
});

test('Should account for a parent Sequence trimBefore in video thumbnails', () => {
	const calculated = calculateTimeline({
		overrideIdsToNodePaths: {},
		sequences: [
			{
				displayName: 'Independent clip 01',
				documentationLink: null,
				duration: 54,
				from: 24,
				trimBefore: 24,
				id: 'sequence',
				parent: null,
				rootId: 'root',
				showInTimeline: true,
				type: 'sequence',
				nonce: [[0, 0]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
			},
			{
				displayName: 'Independent video 01',
				documentationLink: null,
				duration: 54,
				from: 0,
				trimBefore: null,
				id: 'video',
				parent: 'sequence',
				rootId: 'root',
				showInTimeline: true,
				type: 'video',
				nonce: [[0, 1]],
				getStack,
				refForOutline: null,
				isInsideSeries: false,
				premountDisplay: null,
				postmountDisplay: null,
				controls: null,
				loopDisplay: undefined,
				effects: [],
				frozenFrame: null,
				frozenMediaFrame: null,
				mediaFrameAtSequenceZero: 0,
				src: 'https://remotion.media/video.mp4',
				volume: 1,
				doesVolumeChange: false,
				startMediaFrom: 0,
				playbackRate: 1,
			},
		],
	});
	const video = calculated.find((track) => track.sequence.type === 'video');

	if (!video || video.sequence.type !== 'video') {
		throw new Error('Expected a video track');
	}

	expect(
		getTimelineMediaStartFrame({
			startMediaFrom: video.sequence.startMediaFrom,
			mediaFrameAtSequenceZero: video.sequence.mediaFrameAtSequenceZero,
			sequenceFrameOffset: video.sequenceFrameOffset,
			playbackRate: video.sequence.playbackRate,
		}),
	).toBe(24);
});
