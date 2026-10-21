import {ALL_FORMATS, Input, UrlSource, VideoSampleSink} from 'mediabunny';
import {createEffect, Internals, type EffectFrameTiming} from 'remotion';
import {expect, test} from 'vitest';
import {getMaxVideoCacheSize, makeMediaCache} from '../caches';
import {extractFrameAndAudio} from '../extract-frame-and-audio';
import {makeNonceManager} from '../nonce-manager';
import {videoIteratorManager} from '../video-iterator-manager';

const timingEffect = (read: (timing: EffectFrameTiming | undefined) => void) =>
	createEffect<Record<string, never>, null>({
		type: 'test.frame-timing',
		label: 'Frame timing',
		documentationLink: null,
		backend: '2d',
		calculateKey: () => 'frame-timing',
		setup: () => null,
		apply: ({frameTiming, target}) => {
			read(frameTiming);
			const context = target.getContext('2d')!;
			context.fillStyle = `rgb(${Math.round((frameTiming?.timestampInSeconds ?? 0) * 100)}, 0, 0)`;
			context.fillRect(0, 0, target.width, target.height);
		},
		cleanup: () => {},
		schema: {},
		validateParams: () => {},
	});

test('snapshots the effect clock before an asynchronous source resize', async () => {
	const state = Internals.createEffectChainState(2, 2);
	const source = document.createElement('canvas');
	source.width = 4;
	source.height = 4;
	const output = document.createElement('canvas');
	output.width = 2;
	output.height = 2;
	const timing = {timestampInSeconds: 1, fps: 25};
	let received: EffectFrameTiming | undefined;
	const effect = timingEffect((value) => {
		received = value;
	})();
	try {
		const render = Internals.runEffectChain({
			state,
			source,
			output,
			width: 4,
			height: 4,
			effects: [{...effect, memoized: true}],
			frameTiming: timing,
		});
		timing.timestampInSeconds = 2;
		expect(await render).toBe(true);
		expect(received).toEqual({timestampInSeconds: 1, fps: 25});
		expect(Object.isFrozen(received)).toBe(true);
		expect(output.getContext('2d')!.getImageData(0, 0, 1, 1).data[0]).toBe(100);
	} finally {
		Internals.cleanupEffectChainState(state);
	}
});

test('preview effects and rendered extraction retain the same decoded source PTS', async () => {
	const src = '/bigbuckbunny.mp4';
	const mediaCache = makeMediaCache();
	const input = new Input({source: new UrlSource(src), formats: ALL_FORMATS});
	const track = (await input.getPrimaryVideoTrack())!;
	const sink = new VideoSampleSink(track);
	const canvas = document.createElement('canvas');
	const state = Internals.createEffectChainState(
		await track.getDisplayWidth(),
		await track.getDisplayHeight(),
	);
	let received: EffectFrameTiming | undefined;
	const effect = timingEffect((value) => {
		received = value;
	})();
	const manager = await videoIteratorManager({
		fps: 25,
		videoTrack: track,
		canvas,
		context: canvas.getContext('2d'),
		getIsDisposed: () => false,
		delayPlaybackHandleIfNotPremounting: () => ({
			unblock: () => {},
			[Symbol.dispose]: () => {},
		}),
		getOnVideoFrameCallback: () => null,
		logLevel: 'error',
		drawDebugOverlay: () => {},
		getLoopSegmentMediaEndTimestamp: () => 10,
		getStartTime: () => 0,
		getIsLooping: () => false,
		getEffects: () => [{...effect, memoized: true}],
		getEffectChainState: () => state,
		maxCanvasSinkFrameSize: null,
	});
	const nonce = makeNonceManager();
	try {
		await manager.startVideoIterator(0, nonce.createAsyncOperation());
		// Non-frame-aligned requests, including a trim, speed change and loop.
		for (const settings of [
			{
				timeInSeconds: 0.123,
				trimBefore: undefined,
				trimAfter: undefined,
				playbackRate: 1,
				loop: false,
			},
			{
				timeInSeconds: 0.123,
				trimBefore: 25,
				trimAfter: undefined,
				playbackRate: 2,
				loop: false,
			},
			{
				timeInSeconds: 0.543,
				trimBefore: 10,
				trimAfter: 20,
				playbackRate: 2,
				loop: true,
			},
		]) {
			const sourceTime =
				(settings.loop
					? (settings.timeInSeconds * settings.playbackRate) % (10 / 25)
					: settings.timeInSeconds * settings.playbackRate) +
				(settings.trimBefore ?? 0) / 25;
			const expected = (await sink.getSample(sourceTime))!;
			try {
				await manager.seek({
					newTime: sourceTime,
					nonce: nonce.createAsyncOperation(),
					fps: 25,
					playbackRate: settings.playbackRate,
					isPlaying: false,
					continuousPlayback: null,
				});
				expect(received?.timestampInSeconds).toBeCloseTo(expected.timestamp, 6);
				expect(received?.fps).toBe(25);
				const result = await extractFrameAndAudio({
					...settings,
					src,
					fps: 25,
					sampleRate: 48000,
					durationInSeconds: 1 / 25,
					includeAudio: false,
					includeVideo: true,
					audioStreamIndex: null,
					logLevel: 'error',
					maxCacheSize: getMaxVideoCacheSize('error'),
					credentials: undefined,
					mediaCache,
				});
				expect(result.type).toBe('success');
				if (result.type !== 'success')
					throw new Error('Frame extraction failed');
				try {
					// VideoFrame timestamps have integer-microsecond precision.
					expect(
						Math.abs(result.frameTimestampInSeconds! - expected.timestamp),
					).toBeLessThanOrEqual(0.000001);
				} finally {
					result.frame?.close();
				}
			} finally {
				expected.close();
			}
		}
	} finally {
		manager.destroy();
		Internals.cleanupEffectChainState(state);
		input.dispose();
		mediaCache.dispose('error');
	}
});
