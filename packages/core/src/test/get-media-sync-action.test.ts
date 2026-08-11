import {describe, expect, test} from 'bun:test';
import type {GetMediaSyncActionInput} from '../get-media-sync-action.js';
import {getMediaSyncAction} from '../get-media-sync-action.js';

const makeInput = (
	overrides: Partial<GetMediaSyncActionInput> = {},
): GetMediaSyncActionInput => ({
	duration: Number.POSITIVE_INFINITY,
	currentTime: 0,
	paused: false,
	ended: false,
	desiredUnclampedTime: 5,
	mediaTagTime: 5,
	mediaTagLastUpdate: 0,
	rvcTime: null,
	rvcLastUpdate: null,
	isVariableFpsVideo: false,
	acceptableTimeShift: 0.45,
	lastSeekDueToShift: null,
	playing: true,
	playbackRate: 1,
	mediaTagBufferingOrStalled: false,
	playerBuffering: false,
	absoluteFrame: 30,
	onlyWarnForMediaSeekingError: false,
	isPremounting: false,
	isPostmounting: false,
	pauseWhenBuffering: true,
	...overrides,
});

describe('shouldBeTime clamping', () => {
	test('clamps to duration when finite', () => {
		const action = getMediaSyncAction(
			makeInput({duration: 3, desiredUnclampedTime: 5, playing: false}),
		);
		// big shift is triggered first here, but shouldBeTime is exposed on it
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.shouldBeTime).toBe(3);
		}
	});

	test('uses desired time when duration is NaN', () => {
		const action = getMediaSyncAction(
			makeInput({
				duration: Number.NaN,
				desiredUnclampedTime: 5,
				mediaTagTime: 0,
				playing: false,
			}),
		);
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.shouldBeTime).toBe(5);
		}
	});

	test('uses desired time when duration is Infinity', () => {
		const action = getMediaSyncAction(
			makeInput({
				duration: Number.POSITIVE_INFINITY,
				desiredUnclampedTime: 5,
				mediaTagTime: 0,
				playing: false,
			}),
		);
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.shouldBeTime).toBe(5);
		}
	});
});

describe('seek-due-to-shift (big time shift)', () => {
	test('triggers when time shift exceeds the acceptable shift', () => {
		const action = getMediaSyncAction(
			makeInput({mediaTagTime: 0, desiredUnclampedTime: 5, paused: true}),
		);
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.shouldBeTime).toBe(5);
			// playing && playbackRate > 0
			expect(action.bufferUntilFirstFrame).toBe(true);
			// playing && paused
			expect(action.playReason).toBe(
				'player is playing but media tag is paused, and just seeked',
			);
			expect(action.warnAboutNonSeekable).toBe(true);
		}
	});

	test('does not set playReason when the media tag is not paused', () => {
		const action = getMediaSyncAction(
			makeInput({mediaTagTime: 0, paused: false}),
		);
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.playReason).toBe(null);
		}
	});

	test('does not buffer when not playing', () => {
		const action = getMediaSyncAction(
			makeInput({mediaTagTime: 0, playing: false}),
		);
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.bufferUntilFirstFrame).toBe(false);
			expect(action.playReason).toBe(null);
		}
	});

	test('does not warn when onlyWarnForMediaSeekingError is true', () => {
		const action = getMediaSyncAction(
			makeInput({mediaTagTime: 0, onlyWarnForMediaSeekingError: true}),
		);
		expect(action.type).toBe('seek-due-to-shift');
		if (action.type === 'seek-due-to-shift') {
			expect(action.warnAboutNonSeekable).toBe(false);
		}
	});

	test('is skipped when the last shift-seek already targeted this time', () => {
		const action = getMediaSyncAction(
			makeInput({
				mediaTagTime: 0,
				desiredUnclampedTime: 5,
				lastSeekDueToShift: 5,
			}),
		);
		expect(action.type).not.toBe('seek-due-to-shift');
	});
});

describe('rvc vs media tag time shift', () => {
	// The "most recent" comparison uses `rvcTime > mediaTagLastUpdate`, which is
	// the (odd) behavior of the original implementation. These inputs are chosen
	// so that branch is taken: rvcLastUpdate is truthy and rvcTime (0.5) is
	// greater than mediaTagLastUpdate (0).
	test('uses rvc time shift when it is more recent', () => {
		// media tag is on time, but rvc reports a big shift → should still trigger
		const action = getMediaSyncAction(
			makeInput({
				desiredUnclampedTime: 10,
				mediaTagTime: 10,
				mediaTagLastUpdate: 0,
				rvcTime: 0.5,
				rvcLastUpdate: 1,
			}),
		);
		expect(action.type).toBe('seek-due-to-shift');
	});

	test('ignores rvc time shift for variable fps videos', () => {
		const action = getMediaSyncAction(
			makeInput({
				desiredUnclampedTime: 10,
				mediaTagTime: 10,
				mediaTagLastUpdate: 0,
				rvcTime: 0.5,
				rvcLastUpdate: 1,
				isVariableFpsVideo: true,
				// media tag says on time, rvc ignored → no big shift
				currentTime: 10,
			}),
		);
		expect(action.type).not.toBe('seek-due-to-shift');
	});
});

describe('seek-if-not-playing', () => {
	test('when not playing and above the seek threshold', () => {
		const action = getMediaSyncAction(
			makeInput({playing: false, currentTime: 0, mediaTagTime: 5}),
		);
		expect(action.type).toBe('seek-if-not-playing');
		if (action.type === 'seek-if-not-playing') {
			expect(action.why).not.toBe(null);
			expect(action.shouldBeTime).toBe(5);
		}
	});

	test('does not seek when within the (paused) threshold', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: false,
				currentTime: 5,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('seek-if-not-playing');
		if (action.type === 'seek-if-not-playing') {
			expect(action.why).toBe(null);
		}
	});

	test('when playing but something else is buffering', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: true,
				playerBuffering: true,
				mediaTagBufferingOrStalled: false,
				currentTime: 0,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('seek-if-not-playing');
	});
});

describe('none', () => {
	test('playing, on time, not paused, not first frame', () => {
		const action = getMediaSyncAction(
			makeInput({currentTime: 5, desiredUnclampedTime: 5, mediaTagTime: 5}),
		);
		expect(action.type).toBe('none');
	});

	test('playing and player buffering while media tag is also buffering', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: true,
				playerBuffering: true,
				mediaTagBufferingOrStalled: true,
				currentTime: 5,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('none');
	});
});

describe('play-and-seek', () => {
	test('playing but media tag is paused', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: true,
				paused: true,
				ended: false,
				currentTime: 5,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('play-and-seek');
		if (action.type === 'play-and-seek') {
			expect(action.playReason).toBe(
				'player is playing and media tag is paused',
			);
			// within threshold → no seek
			expect(action.why).toBe(null);
			expect(action.bufferUntilFirstFrame).toBe(true);
		}
	});

	test('playing on the first absolute frame', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: true,
				paused: false,
				absoluteFrame: 0,
				currentTime: 5,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('play-and-seek');
		if (action.type === 'play-and-seek') {
			expect(action.playReason).toBe(
				'player is playing and absolute frame is 0',
			);
		}
	});

	test('seeks and does not buffer for variable fps videos', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: true,
				paused: true,
				absoluteFrame: 30,
				isVariableFpsVideo: true,
				currentTime: 0,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('play-and-seek');
		if (action.type === 'play-and-seek') {
			expect(action.why).not.toBe(null);
			expect(action.bufferUntilFirstFrame).toBe(false);
		}
	});

	test('does not buffer when playback rate is 0', () => {
		const action = getMediaSyncAction(
			makeInput({
				playing: true,
				paused: true,
				playbackRate: 0,
				currentTime: 5,
				desiredUnclampedTime: 5,
				mediaTagTime: 5,
			}),
		);
		expect(action.type).toBe('play-and-seek');
		if (action.type === 'play-and-seek') {
			expect(action.bufferUntilFirstFrame).toBe(false);
		}
	});
});
