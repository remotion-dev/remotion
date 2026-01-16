import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {assert, expect, test} from 'vitest';
import {getMaxVideoCacheSize, keyframeManager} from '../caches';
import {makeNonceManager} from '../nonce-manager';
import {extractFrame} from '../video-extraction/extract-frame';
import {videoIteratorManager} from '../video-iterator-manager';

test('in preview, should properly buffer and draw frames', async () => {
	const input = new Input({
		source: new UrlSource('/no-frames-in-beginning.webm'),
		formats: ALL_FORMATS,
	});

	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		throw new Error('No video track found');
	}

	const manager = videoIteratorManager({
		getIsLooping: () => false,
		getEndTime: () => {
			throw new Error('not implemented');
		},
		getStartTime: () => {
			throw new Error('not implemented');
		},
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		context: null,
		canvas: null,
		videoTrack,
		drawDebugOverlay: () => {},
		logLevel: 'info',
		getOnVideoFrameCallback: () => null,
	});

	const nonceManager = makeNonceManager();

	await manager.startVideoIterator(0, nonceManager.createAsyncOperation());
	await manager.seek({
		newTime: 0.03,
		nonce: nonceManager.createAsyncOperation(),
	});
	await manager.seek({
		newTime: 1,
		nonce: nonceManager.createAsyncOperation(),
	});
	await manager.seek({
		newTime: 2,
		nonce: nonceManager.createAsyncOperation(),
	});

	const iteratorsCreated = manager.getVideoIteratorsCreated();
	expect(iteratorsCreated).toBe(1);

	await manager.seek({
		newTime: 4.5,
		nonce: nonceManager.createAsyncOperation(),
	});

	const iteratorsCreated2 = manager.getVideoIteratorsCreated();
	expect(iteratorsCreated2).toBe(2);
});

test('in rendering, should also be smart', async () => {
	let lastFrame;
	for (let i = 0; i < 5; i++) {
		const frame = await extractFrame({
			src: '/no-frames-in-beginning.webm',
			timeInSeconds: i * 0.4,
			logLevel: 'info',
			loop: false,
			trimAfter: undefined,
			trimBefore: undefined,
			playbackRate: 1,
			fps: 30,
			maxCacheSize: getMaxVideoCacheSize('info'),
		});
		assert(frame.type === 'success');
		if (lastFrame) {
			expect(frame.sample === lastFrame).toBe(true);
			continue;
		}

		expect(frame.sample?.timestamp).toBe(4.045);
		lastFrame = frame.sample;
	}

	const firstRealFrame = await extractFrame({
		src: '/no-frames-in-beginning.webm',
		timeInSeconds: 5,
		logLevel: 'info',
		loop: false,
		trimAfter: undefined,
		trimBefore: undefined,
		playbackRate: 1,
		fps: 30,
		maxCacheSize: getMaxVideoCacheSize('info'),
	});

	assert(firstRealFrame.type === 'success');
	expect(firstRealFrame.sample?.timestamp).toBe(4.979);

	keyframeManager.clearAll('info');
});
