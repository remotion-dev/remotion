import {assert, expect, test, vi} from 'vitest';
import {extractAudio} from '../audio-extraction/extract-audio';
import {audioManager, getMaxVideoCacheSize} from '../caches';
import {generateSine} from './sine';

const {getSamples} = vi.hoisted(() => ({
	getSamples: vi.fn(),
}));

vi.mock('../get-sink', () => ({
	getSink: async () => ({
		getAudio: async () => ({sampleSink: {}}),
		actualMatroskaTimestamps: {},
		isMatroska: false,
		getDuration: async () => null,
	}),
}));

test('uses the final included sample for resampling', async () => {
	const sampleRate = 44_100;
	const frameCount = 100;
	const duration = frameCount / sampleRate;

	getSamples.mockResolvedValue([
		{
			duration,
			sampleRate,
			timestamp: 0,
			toAudioData: () =>
				generateSine({
					amplitude: 1_000,
					frequency: 440,
					length: frameCount,
					phase: 0,
					sampleRate,
				}),
		},
		{
			duration,
			sampleRate,
			timestamp: duration,
		},
	]);
	vi.spyOn(audioManager, 'getIterator').mockResolvedValue({
		getSamples,
	} as unknown as Awaited<ReturnType<typeof audioManager.getIterator>>);
	vi.spyOn(audioManager, 'logOpenFrames').mockImplementation(() => undefined);

	const result = await extractAudio({
		audioStreamIndex: 0,
		credentials: undefined,
		durationInSeconds: duration,
		fps: 30,
		logLevel: 'info',
		loop: false,
		maxCacheSize: getMaxVideoCacheSize('info'),
		playbackRate: 1,
		src: 'test://audio',
		timeInSeconds: 0,
		trimAfter: undefined,
		trimBefore: undefined,
	});

	assert(typeof result === 'object');
	assert(result.data);
	expect(result.data.numberOfFrames).toBe(109);
});
