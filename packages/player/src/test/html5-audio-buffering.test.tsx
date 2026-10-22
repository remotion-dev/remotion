import {afterEach, expect, mock, spyOn, test} from 'bun:test';
import React, {createRef, useContext, useState} from 'react';
import {Html5Audio, Internals, useBufferState} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

const originalDescriptors = Object.getOwnPropertyDescriptors(
	HTMLMediaElement.prototype,
);
afterEach(() => {
	cleanup();
	mock.restore();
	Object.defineProperties(HTMLMediaElement.prototype, originalDescriptors);
});

const setup = (
	pauseWhenBuffering = true,
	retainAudioDuringBuffering: boolean | null = true,
) => {
	const player = createRef<PlayerRef>();
	const audio = createRef<HTMLAudioElement>();
	const times = new WeakMap<HTMLMediaElement, number>();
	const paused = new WeakMap<HTMLMediaElement, boolean>();
	const writes: number[] = [];
	let readyState = 4;
	Object.defineProperties(HTMLMediaElement.prototype, {
		readyState: {configurable: true, get: () => readyState},
		duration: {configurable: true, get: () => 60},
		ended: {configurable: true, get: () => false},
		paused: {
			configurable: true,
			get(this: HTMLMediaElement) {
				return paused.get(this) ?? true;
			},
		},
		currentTime: {
			configurable: true,
			get(this: HTMLMediaElement) {
				return times.get(this) ?? 0;
			},
			set(this: HTMLMediaElement, value: number) {
				times.set(this, value);
				writes.push(value);
			},
		},
	});
	spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(
		function (this: HTMLMediaElement) {
			paused.set(this, false);
			return Promise.resolve();
		},
	);
	spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
		function (this: HTMLMediaElement) {
			paused.set(this, true);
		},
	);
	spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);
	spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
	let buffer!: ReturnType<typeof useBufferState>;
	let timeline!: React.ContextType<typeof Internals.SetTimelineContext>;
	let setSource!: (source: string) => void;
	let setLocalRate!: (rate: number) => void;
	let setRetention!: (enabled: boolean) => void;
	const Composition = () => {
		buffer = useBufferState();
		timeline = useContext(Internals.SetTimelineContext);
		const [source, changeSource] = useState('voice.mp3');
		const [rate, changeRate] = useState(1);
		const [retention, changeRetention] = useState(retainAudioDuringBuffering);
		setRetention = changeRetention;
		setSource = changeSource;
		setLocalRate = changeRate;
		return (
			<Html5Audio
				ref={audio}
				src={source}
				playbackRate={rate}
				pauseWhenBuffering={pauseWhenBuffering}
				{...(retention === null ? {} : {retainAudioDuringBuffering: retention})}
				showInTimeline={false}
			/>
		);
	};

	const playerElement = (globalRate: number, fps: number) => (
		<Player
			ref={player}
			component={Composition}
			errorFallback={({error}) => {
				throw error;
			}}
			durationInFrames={1800}
			compositionWidth={320}
			compositionHeight={180}
			fps={fps}
			playbackRate={globalRate}
			numberOfSharedAudioTags={0}
		/>
	);
	const view = render(playerElement(1, 30));
	act(() => player.current!.seekTo(300));
	act(() => player.current!.play());
	expect(audio.current).not.toBeNull();
	const advanceAudio = (time: number) =>
		act(() => {
			times.set(audio.current!, time);
			audio.current!.dispatchEvent(new Event('timeupdate'));
		});
	advanceAudio(10.3);
	writes.length = 0;
	let handle!: ReturnType<typeof buffer.delayPlayback>;
	act(() => {
		handle = buffer.delayPlayback();
	});
	return {
		player,
		isBuffering: () => timeline.isBuffering(),
		audio,
		writes,
		nativePause: () => paused.set(audio.current!, true),
		advanceAudio,
		changeSource: (source: string) => act(() => setSource(source)),
		changeRetention: (enabled: boolean) => act(() => setRetention(enabled)),
		changeLocalRate: (rate: number) => act(() => setLocalRate(rate)),
		setReadyState: (state: number) => {
			readyState = state;
		},
		changeClock: (rate: number, fps: number) =>
			view.rerender(playerElement(rate, fps)),
		waitAgain: () =>
			act(() => {
				handle = buffer.delayPlayback();
			}),
		resume: () => act(() => handle.unblock()),
		advanceTimeline: (frame: number) =>
			act(() =>
				timeline.setFrameWithoutSeek((frames) =>
					Object.fromEntries(Object.keys(frames).map((id) => [id, frame])),
				),
			),
	};
};

test('retains audio during another media wait and resumes without seeking after catch-up', () => {
	const s = setup();
	expect(s.audio.current!.paused).toBe(true);
	expect(s.audio.current!.currentTime).toBe(10.3);
	expect(s.writes).toEqual([]);
	s.resume();
	expect(s.audio.current!.paused).toBe(true);
	s.advanceTimeline(310);
	expect(s.audio.current!.paused).toBe(false);
	expect(s.writes).toEqual([]);
});

test.each([300, 299, 301, 150])(
	'honors explicit seek to frame %s during recovery',
	(frame) => {
		const s = setup();
		s.resume();
		act(() => s.player.current!.seekTo(frame));
		expect(s.audio.current!.currentTime).toBeCloseTo(frame / 30, 6);
	},
);

test('restores ordinary synchronization on pause', () => {
	const s = setup();
	s.resume();
	act(() => s.player.current!.pause());
	expect(s.audio.current!.currentTime).toBe(10);
});

test('retains correction of drift beyond the existing tolerance', () => {
	const s = setup();
	s.resume();
	s.advanceAudio(12);
	s.advanceTimeline(301);
	expect(s.audio.current!.currentTime).toBeCloseTo(301 / 30, 6);
});

test('resets recovery when the audio source changes', () => {
	const s = setup();
	s.changeSource('other.mp3');
	expect(s.audio.current!.currentTime).toBe(10);
});

test('resets recovery when the authored audio rate changes', () => {
	const s = setup();
	s.changeLocalRate(2);
	expect(s.audio.current!.currentTime).toBe(20);
});

test('resets recovery at a backwards timeline boundary without explicit seeking', () => {
	const s = setup();
	s.resume();
	s.advanceTimeline(299);
	expect(s.audio.current!.currentTime).toBeCloseTo(299 / 30, 6);
});

test('does not retain recovery when the audio itself buffers', () => {
	const s = setup();
	s.setReadyState(2);
	act(() => s.audio.current!.dispatchEvent(new Event('waiting')));
	s.setReadyState(4);
	act(() => s.audio.current!.dispatchEvent(new Event('canplay')));
	s.resume();
	expect(s.audio.current!.currentTime).toBe(10);
});

test('resets recovery on a Player playback rate change', () => {
	const s = setup();
	s.changeClock(2, 30);
	expect(s.audio.current!.currentTime).toBe(10);
	expect(s.audio.current!.playbackRate).toBe(2);
});

test('resets recovery on an fps change', () => {
	const s = setup();
	s.changeClock(1, 60);
	expect(s.audio.current!.currentTime).toBe(5);
});

test('honors a same-frame seek before buffering ends', () => {
	const s = setup();
	act(() => s.player.current!.seekTo(300));
	expect(s.audio.current!.currentTime).toBe(10);
});

test('handles successive waits without seeking in either direction', () => {
	const s = setup();
	s.resume();
	s.advanceTimeline(310);
	s.advanceAudio(10.6);
	s.waitAgain();
	s.resume();
	s.advanceTimeline(319);
	expect(s.audio.current!.paused).toBe(false);
	expect(s.writes).toEqual([]);
});

test('preserves behavior when pauseWhenBuffering is disabled', () => {
	const s = setup(false);
	expect(s.audio.current!.currentTime).toBe(10);
});

test('keeps recovery through a second wait before the resumed native clock advances', () => {
	const s = setup();
	s.resume();
	s.advanceTimeline(310);
	expect(s.audio.current!.paused).toBe(false);
	// play() has cleared paused, but output/currentTime has not advanced yet.
	s.advanceTimeline(316);
	s.waitAgain();
	expect(s.writes).toEqual([]);
});

test('returns to ordinary synchronization after native audio has resumed progressing', () => {
	const s = setup();
	s.resume();
	s.advanceTimeline(310);
	s.advanceAudio(10.4);
	s.advanceTimeline(312);
	// A later native pause is no longer part of the original buffering recovery.
	s.nativePause();
	s.advanceTimeline(319);
	expect(s.audio.current!.currentTime).toBeCloseTo(319 / 30, 6);
});

test('retains a small audio lag at a later wait after recovery has ended', () => {
	const s = setup();
	s.resume();
	s.advanceTimeline(310);
	s.advanceAudio(10.4);
	s.advanceTimeline(312);
	s.advanceTimeline(318);
	s.waitAgain();
	expect(s.writes).toEqual([]);
});

test.each([true, false])(
	'keeps own-audio buffering controlled by pauseWhenBuffering=%s',
	(enabled) => {
		const s = setup(enabled);
		s.resume();
		s.setReadyState(2);
		act(() => s.audio.current!.dispatchEvent(new Event('waiting')));
		expect(s.isBuffering()).toBe(enabled);
		s.setReadyState(4);
		act(() => s.audio.current!.dispatchEvent(new Event('canplay')));
		expect(s.isBuffering()).toBe(false);
	},
);

test.each([null, false])(
	'preserves legacy synchronization when retainAudioDuringBuffering=%s',
	(enabled) => {
		const s = setup(true, enabled);
		expect(s.audio.current!.currentTime).toBe(10);
		expect(s.writes).toEqual([10]);
		expect(s.audio.current!.hasAttribute('retainaudioduringbuffering')).toBe(
			false,
		);
	},
);

test('disabling retention during recovery restores ordinary synchronization', () => {
	const s = setup();
	s.changeRetention(false);
	expect(s.audio.current!.currentTime).toBe(10);
});

test.each([null, false])(
	'keeps own-audio buffering active with retention=%s',
	(enabled) => {
		const s = setup(true, enabled);
		s.resume();
		s.setReadyState(2);
		act(() => s.audio.current!.dispatchEvent(new Event('waiting')));
		expect(s.isBuffering()).toBe(true);
		s.setReadyState(4);
		act(() => s.audio.current!.dispatchEvent(new Event('canplay')));
		expect(s.isBuffering()).toBe(false);
	},
);
