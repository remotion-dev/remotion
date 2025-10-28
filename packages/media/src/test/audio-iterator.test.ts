import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {audioIteratorManager} from '../audio-iterator-manager';
import {makeNonceManager} from '../nonce-manager';

const prepare = async () => {
	const input = new Input({
		source: new UrlSource('https://remotion.media/video.mp4'),
		formats: ALL_FORMATS,
	});
	const audioTrack = await input.getPrimaryAudioTrack();
	if (!audioTrack) {
		throw new Error('No audio track found');
	}

	const manager = audioIteratorManager({
		audioTrack,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
		}),
		sharedAudioContext: new AudioContext(),
	});

	const fps = 30;
	const playbackRate = 1;
	const getIsPlaying = () => true;

	return {
		manager,
		fps,
		playbackRate,
		getIsPlaying,
	};
};

test('media player should work', async () => {
	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	await manager.seek({
		newTime: 9.96,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	await manager.seek({
		newTime: 0.04,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		9.941333333333333, 9.962666666666667, 9.984, 0, 0.021333333333333333,
		0.042666666666666665, 0.064, 0.08533333333333333, 0.10666666666666667,
		0.128,
	]);
});

test('should not create too many iterators when the audio ends', async () => {
	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	await manager.seek({
		newTime: 9.97,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});
	await manager.seek({
		newTime: 9.98,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});
	await manager.seek({
		newTime: 9.99,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(1);

	expect(scheduledChunks).toEqual([9.962666666666667, 9.984, 9.984, 9.984]);
});

test('should create more iterators when seeking ', async () => {
	const {manager, fps, playbackRate, getIsPlaying} = await prepare();

	const scheduledChunks: number[] = [];
	const scheduleAudioNode = (
		node: AudioBufferSourceNode,
		mediaTimestamp: number,
	) => {
		node.start(mediaTimestamp);
		setTimeout(
			() => {
				node.stop();
			},
			(node.buffer?.duration ?? 0) * 1000,
		);
		scheduledChunks.push(mediaTimestamp);
	};

	await manager.seek({
		newTime: 0,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});
	await manager.seek({
		newTime: 1,
		scheduleAudioNode,
		fps,
		getIsPlaying,
		nonce: makeNonceManager().createAsyncOperation(),
		playbackRate,
		bufferState: {
			delayPlayback: () => ({
				unblock: () => {},
			}),
		},
	});

	const created = manager.getAudioIteratorsCreated();
	expect(created).toBe(2);

	expect(scheduledChunks).toEqual([
		0, 0.021333333333333333, 0.042666666666666665, 0.9813333333333333,
		1.0026666666666666, 1.024,
	]);
});
