import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, renderHook} from '@testing-library/react';
import {useRef} from 'react';
import {useRequestVideoCallbackTime} from '../use-request-video-callback-time.js';

afterEach(() => {
	cleanup();
});

type FrameCallback = (now: number, info: {mediaTime: number}) => void;

const makeVideoTag = () => {
	const callbacks: FrameCallback[] = [];
	const listeners: Record<string, (() => void)[]> = {};
	const tag = {
		currentTime: 0,
		seeking: false,
		requestVideoFrameCallback: (cb: FrameCallback) => {
			callbacks.push(cb);
			return callbacks.length;
		},
		cancelVideoFrameCallback: () => undefined,
		addEventListener: (name: string, cb: () => void) => {
			(listeners[name] ??= []).push(cb);
		},
		removeEventListener: (name: string, cb: () => void) => {
			listeners[name] = (listeners[name] ?? []).filter((l) => l !== cb);
		},
	};

	const present = (mediaTime: number) => {
		const cb = callbacks.shift();
		if (!cb) {
			throw new Error('No frame callback registered');
		}

		cb(performance.now(), {mediaTime});
	};

	// The browser sets `seeking` synchronously and fires the event right after
	const startSeek = (to: number) => {
		tag.seeking = true;
		tag.currentTime = to;
		for (const l of listeners.seeking ?? []) {
			l();
		}
	};

	const finishSeek = () => {
		tag.seeking = false;
	};

	const fireSeekingEvent = () => {
		for (const l of listeners.seeking ?? []) {
			l();
		}
	};

	return {
		tag,
		present,
		startSeek,
		finishSeek,
		fireSeekingEvent,
		listeners,
	};
};

const setup = () => {
	const video = makeVideoTag();
	let detected = 0;
	const hook = renderHook(() => {
		const mediaRef = useRef<HTMLVideoElement | null>(
			video.tag as unknown as HTMLVideoElement,
		);
		const lastSeek = useRef<number | null>(null);
		const currentTime = useRequestVideoCallbackTime({
			mediaRef,
			mediaType: 'video',
			lastSeek,
			onVariableFpsVideoDetected: () => {
				detected++;
			},
		});
		return {currentTime, lastSeek};
	});

	const reading = () => hook.result.current.currentTime.current?.time ?? null;

	return {
		...video,
		hook,
		reading,
		seek: (to: number) => {
			hook.result.current.lastSeek.current = to;
			video.startSeek(to);
		},
		getDetected: () => detected,
	};
};

test('frame callback samples update the reading', () => {
	const {present, reading} = setup();
	act(() => present(0.1));
	expect(reading()).toBe(0.1);
	act(() => present(0.133));
	expect(reading()).toBe(0.133);
});

// #12588: a frame from before the seek can still be presented after it
test('drops the reading on seek and ignores samples until the seek is done', () => {
	const {present, reading, seek, finishSeek, hook} = setup();
	act(() => present(0.1));
	seek(9);
	expect(reading()).toBeNull();

	act(() => present(0.133));
	expect(reading()).toBeNull();

	finishSeek();
	act(() => present(9));
	expect(reading()).toBe(9);
	expect(hook.result.current.currentTime.current?.lastUpdate).toBeNumber();

	act(() => present(9.033));
	expect(reading()).toBe(9.033);
});

test('a backward seek is handled the same way', () => {
	const {present, reading, seek, finishSeek} = setup();
	act(() => present(0.1));
	seek(9);
	finishSeek();
	act(() => present(9));
	seek(1);
	act(() => present(9.033));
	expect(reading()).toBeNull();
	finishSeek();
	act(() => present(1.01));
	expect(reading()).toBe(1.01);
});

test('a second seek before the first one landed starts over', () => {
	const {present, reading, seek, finishSeek} = setup();
	act(() => present(2));
	seek(9);
	seek(2.5);
	act(() => present(9));
	expect(reading()).toBeNull();
	finishSeek();
	act(() => present(2.5));
	expect(reading()).toBe(2.5);
});

// The attribute is set synchronously, the event is a queued task
test('ignores a sample while seeking is set before the event arrived', () => {
	const {present, reading, tag, fireSeekingEvent, finishSeek} = setup();
	act(() => present(0.1));
	tag.seeking = true;
	act(() => present(0.133));
	expect(reading()).toBe(0.1);
	fireSeekingEvent();
	expect(reading()).toBeNull();
	finishSeek();
	act(() => present(9));
	expect(reading()).toBe(9);
});

test('a seeking event after the seek already finished only costs one sample', () => {
	const {present, reading, tag, fireSeekingEvent} = setup();
	act(() => present(0.1));
	tag.seeking = true;
	tag.seeking = false;
	act(() => present(9));
	expect(reading()).toBe(9);
	fireSeekingEvent();
	expect(reading()).toBeNull();
	act(() => present(9.033));
	expect(reading()).toBe(9.033);
});

test('a pre-seek frame does not count as a variable fps jump', () => {
	const {present, seek, finishSeek, getDetected} = setup();
	act(() => present(0.1));
	act(() => present(0.133));
	seek(9);
	act(() => present(1));
	finishSeek();
	act(() => present(9));
	act(() => present(9.033));
	expect(getDetected()).toBe(0);
});

test('still detects a jump that no seek explains', () => {
	const {present, getDetected} = setup();
	act(() => present(0.1));
	act(() => present(2));
	expect(getDetected()).toBe(1);
});

test('removes the seeking listener on unmount', () => {
	const {hook, listeners} = setup();
	expect(listeners.seeking).toHaveLength(1);
	hook.unmount();
	expect(listeners.seeking).toHaveLength(0);
});
