import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {makeNonceManager} from '../nonce-manager';
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
		delayPlaybackHandleIfNotPremounting: () => ({unblock: () => {}}),
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
