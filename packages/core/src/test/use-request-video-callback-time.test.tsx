import {afterEach, expect, test} from 'bun:test';
import {cleanup, renderHook} from '@testing-library/react';
import {useRequestVideoCallbackTime} from '../use-request-video-callback-time.js';

afterEach(() => {
	cleanup();
});

const makeVideo = () => {
	const video = document.createElement('video');
	let pending: VideoFrameRequestCallback | null = null;
	video.requestVideoFrameCallback = (cb) => {
		pending = cb;
		return 1;
	};

	video.cancelVideoFrameCallback = () => {
		pending = null;
	};

	const presentFrame = (mediaTime: number, presentationTime: number) => {
		const cb = pending;
		pending = null;
		cb?.(presentationTime, {
			mediaTime,
			presentationTime,
		} as VideoFrameCallbackMetadata);
	};

	return {video, presentFrame};
};

test('ignores frames presented before a seek', () => {
	const {video, presentFrame} = makeVideo();
	const mediaRef = {current: video};
	const lastSeek = {current: null};
	const onVariableFpsVideoDetected = () => undefined;

	const {result} = renderHook(() =>
		useRequestVideoCallbackTime({
			mediaRef,
			mediaType: 'video',
			lastSeek,
			onVariableFpsVideoDetected,
		}),
	);

	presentFrame(1.5, performance.now());
	expect(result.current.current?.time).toBe(1.5);

	const beforeSeek = performance.now();
	video.dispatchEvent(new Event('seeking'));
	expect(result.current.current).toBe(null);

	// Presented before the seek, so it still has the old time
	presentFrame(1.533, beforeSeek - 1);
	expect(result.current.current).toBe(null);

	// The first frame from after the seek is used again
	presentFrame(10, performance.now() + 16);
	expect(result.current.current?.time).toBe(10);
});
