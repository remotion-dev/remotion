import {test, expect} from 'bun:test';
import {createMedia} from '../create-media';
import {bufferWriter} from '../writers/buffer';

test('createMedia should support mp3 container', async () => {
	const writer = bufferWriter;
	const progressTracker = {
		updateTrackProgress: () => {},
		registerTrack: () => {},
	};

	const mediaFn = await createMedia({
		container: 'mp3',
		writer,
		onBytesProgress: () => {},
		onMillisecondsProgress: () => {},
		logLevel: 'info',
		filename: 'test.mp3',
		progressTracker,
		expectedDurationInSeconds: null,
		expectedFrameRate: null,
	});

	expect(mediaFn).toBeDefined();
	expect(typeof mediaFn.addTrack).toBe('function');
	expect(typeof mediaFn.addSample).toBe('function');
	expect(typeof mediaFn.getBlob).toBe('function');
	expect(typeof mediaFn.remove).toBe('function');
	expect(typeof mediaFn.waitForFinish).toBe('function');

	// Test adding an audio track
	const trackResult = await mediaFn.addTrack({
		type: 'audio',
		codec: 'mp3',
		sampleRate: 44100,
		numberOfChannels: 2,
		timescale: 44100,
	});

	expect(trackResult.trackNumber).toBe(1);

	await mediaFn.waitForFinish();
	await mediaFn.remove();
});