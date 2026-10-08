import {expect, test} from 'bun:test';
import {calculateNextFrame} from '../calculate-next-frame.js';
import {createPendingPlaybackFrame} from '../pending-playback-frame.js';

// Mirrors the playback loop: one tick per animation frame on a 60Hz display.
// `commitLate(tick)` decides whether React commits a requested frame only after
// the next tick has already read the current frame.
const play = ({
	ticks,
	playbackSpeed,
	commitLate,
	trackPending = true,
	startFrame = 0,
	lastFrame = 100_000,
	shouldLoop = false,
	seek,
}: {
	ticks: number;
	playbackSpeed: number;
	commitLate: (tick: number) => boolean;
	trackPending?: boolean;
	startFrame?: number;
	lastFrame?: number;
	shouldLoop?: boolean;
	seek?: {atTick: number; frame: number};
}) => {
	let committedFrame = startFrame;
	let queuedFrame: number | null = null;
	let framesAdvanced = 0;
	const pendingFrame = createPendingPlaybackFrame();

	for (let tick = 1; tick <= ticks; tick++) {
		if (seek?.atTick === tick) {
			// Seeks write the frame ref synchronously.
			committedFrame = seek.frame;
			queuedFrame = null;
		}

		const currentFrame = trackPending
			? pendingFrame.resolve(committedFrame)
			: committedFrame;
		const {nextFrame, framesToAdvance} = calculateNextFrame({
			time: (tick * 1000) / 60,
			currentFrame,
			playbackSpeed,
			fps: 30,
			actualFirstFrame: 0,
			actualLastFrame: lastFrame,
			framesAdvanced,
			shouldLoop,
		});
		framesAdvanced += framesToAdvance;
		if (nextFrame !== currentFrame) {
			pendingFrame.request(currentFrame, nextFrame);
			queuedFrame = nextFrame;
		}

		if (queuedFrame !== null && !commitLate(tick)) {
			committedFrame = queuedFrame;
			queuedFrame = null;
		}
	}

	return queuedFrame ?? committedFrame;
};

const every = (n: number) => (tick: number) => tick % n === 0;

test('Late commits drop frames at 2x without tracking the pending frame', () => {
	expect(
		play({
			ticks: 300,
			playbackSpeed: 2,
			commitLate: every(23),
			trackPending: false,
		}),
	).toBeLessThan(300);
});

test('Playback keeps real time at 2x when commits land after the next tick', () => {
	expect(play({ticks: 300, playbackSpeed: 2, commitLate: every(23)})).toBe(300);
	expect(play({ticks: 300, playbackSpeed: 2, commitLate: every(2)})).toBe(300);
	expect(play({ticks: 300, playbackSpeed: 2, commitLate: () => true})).toBe(
		300,
	);
});

test('Playback keeps real time at 1x and 4x with late commits', () => {
	expect(play({ticks: 300, playbackSpeed: 1, commitLate: every(3)})).toBe(150);
	expect(play({ticks: 300, playbackSpeed: 4, commitLate: every(3)})).toBe(600);
});

test('A seek during playback is adopted while a request is pending', () => {
	expect(
		play({
			ticks: 300,
			playbackSpeed: 2,
			commitLate: every(2),
			startFrame: 600,
			seek: {atTick: 151, frame: 100},
		}),
	).toBe(100 + 150);
});

test('Looping playback wraps instead of sticking to the first frame', () => {
	expect(
		play({
			ticks: 300,
			playbackSpeed: 2,
			commitLate: every(2),
			lastFrame: 99,
			shouldLoop: true,
		}),
	).toBe(300 % 100);
});
