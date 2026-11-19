import {
	ALL_FORMATS,
	AudioBufferSink,
	BlobSource,
	Input,
	VideoSampleSink,
} from 'mediabunny';
import {expect, test} from 'vitest';
import {supportsNativeHtmlInCanvas} from '../html-in-canvas';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';
import {
	fractionalHtmlAudio,
	fractionalFreezeLifetime,
	fractionalRevokedImage,
	fractionalCanvasResource,
	fractionalTimedImage,
	fractionalLoopedVideo,
	fractionalNestedAudio,
	fractionalLoopingSequence,
	fractionalRgbSource,
	fractionalShortVideo,
	fractionalUnusedImage,
	fractionalUnusedCanvas,
} from './fixtures/fractional-audio-review';

const readFrame = (frame: VideoFrame) => {
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	const context = canvas.getContext('2d')!;
	context.drawImage(frame, 0, 0);
	return context.getImageData(0, 0, 64, 64).data;
};

test.for(['canvas', 'effects', 'animated', 'gif'] as const)(
	'retains loaded %s resources and skips unused images during fractional audio passes',
	async (kind, {skip}) => {
		if (kind === 'animated' && typeof ImageDecoder === 'undefined') {
			skip();
			return;
		}

		for (const unused of [true, false]) {
			for (const muted of [true, false]) {
				let revoke: (() => void) | null = null;
				let loads = 0;
				const canvases = new Set<HTMLCanvasElement>();
				let frames = 0;
				let wrongPixels = 0;
				const result = await renderMediaOnWeb({
					licenseKey: 'free-license',
					composition: {...fractionalCanvasResource, calculateMetadata: null},
					inputProps: {
						kind,
						unused,
						onResourceReady: (callback) => {
							revoke = callback;
						},
						onResourceCanvas: (canvas) => {
							if (canvas) canvases.add(canvas);
						},
						onImageLoad: () => loads++,
					},
					container: 'mkv',
					videoCodec: 'vp8',
					audioCodec: 'pcm-s16',
					sampleRate: 48000,
					muted,
					onFrame: (frame) => {
						expect(frame.timestamp).toBe(Math.round((frames / 24) * 1_000_000));
						for (const [index, byte] of readFrame(frame).entries()) {
							if (byte !== [16, 40, 80, 255][index % 4]) wrongPixels++;
						}

						if (frames === 0) {
							expect(revoke).not.toBeNull();
							revoke?.();
						}

						frames++;
						return frame;
					},
				});
				expect(frames).toBe(4);
				expect(wrongPixels).toBe(0);
				if (kind === 'canvas') expect(canvases.size).toBe(unused ? 0 : 1);
				if (kind === 'gif') expect(loads).toBe(unused ? 0 : 1);
				using input = new Input({
					formats: ALL_FORMATS,
					source: new BlobSource(await result.getBlob()),
				});
				const track = await input.getPrimaryAudioTrack();
				if (muted) {
					expect(track).toBeNull();
					continue;
				}

				expect(track).not.toBeNull();
				let samples = 0;
				let wrongSamples = 0;
				for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
					for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
						for (const sample of buffer.getChannelData(channel)) {
							if (sample !== 0) wrongSamples++;
						}
					}

					samples += buffer.length;
				}

				expect(samples).toBe(8000);
				expect(wrongSamples).toBe(0);
			}
		}
	},
);

test.for(['sequence', 'loop'] as const)(
	'preserves state when Freeze restores the audio clock around a %s',
	async (kind) => {
		let wrongPixels = 0;
		for (const muted of [true, false]) {
			const lifetime: string[] = [];
			let frames = 0;
			await renderMediaOnWeb({
				licenseKey: 'free-license',
				composition: {...fractionalFreezeLifetime, calculateMetadata: null},
				inputProps: {kind, onLifetime: (event) => lifetime.push(event)},
				container: 'mkv',
				videoCodec: 'vp8',
				audioCodec: 'pcm-s16',
				sampleRate: 48000,
				muted,
				onFrame: (frame) => {
					expect(frame.timestamp).toBe(Math.round((frames / 24) * 1_000_000));
					for (const [index, byte] of readFrame(frame).entries()) {
						if (byte !== [16, 40, 80, 255][index % 4]) wrongPixels++;
					}

					frames++;
					return frame;
				},
			});
			expect(frames).toBe(4);
			expect(lifetime).toEqual(['mount', 'unmount']);
		}

		expect(wrongPixels).toBe(0);
	},
);

test('retains a loaded revoked blob image during unrelated fractional audio passes', async () => {
	for (const muted of [true, false]) {
		let loads = 0;
		let frames = 0;
		let wrongPixels = 0;
		await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {...fractionalRevokedImage, calculateMetadata: null},
			inputProps: {onImageLoad: () => loads++},
			container: 'mkv',
			videoCodec: 'vp8',
			audioCodec: 'pcm-s16',
			sampleRate: 48000,
			muted,
			onFrame: (frame) => {
				expect(frame.timestamp).toBe(Math.round((frames / 24) * 1_000_000));
				for (const [index, byte] of readFrame(frame).entries()) {
					if (byte !== [16, 40, 80, 255][index % 4]) wrongPixels++;
				}

				frames++;
				return frame;
			},
		});
		expect(frames).toBe(4);
		expect(loads).toBe(1);
		expect(wrongPixels).toBe(0);
	}
});

test('does not paint a canvas that exists only during fractional audio passes', async () => {
	let paints = 0;
	let frames = 0;
	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {...fractionalUnusedCanvas, calculateMetadata: null},
		inputProps: {
			onUnexpectedPaint: () => {
				paints++;
			},
		},
		container: 'mkv',
		videoCodec: 'vp8',
		audioCodec: 'pcm-s16',
		sampleRate: 48000,
		onFrame: (frame) => {
			expect(frame.timestamp).toBe(Math.round((frames / 24) * 1_000_000));
			const pixels = readFrame(frame);
			let wrong = 0;
			for (let index = 0; index < pixels.length; index++) {
				if (pixels[index] !== [16, 40, 80, 255][index % 4]) wrong++;
			}

			expect(wrong).toBe(0);
			frames++;
			return frame;
		},
	});
	expect(frames).toBe(4);
	expect(paints).toBe(0);
	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(await result.getBlob()),
	});
	const track = await input.getPrimaryAudioTrack();
	expect(track).not.toBeNull();
	let samples = 0;
	let wrongSamples = 0;
	for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
		for (let channel = 0; channel < 2; channel++) {
			const pcm = buffer.getChannelData(channel);
			for (let index = 0; index < pcm.length; index++) {
				const absolute = samples + index;
				const expected =
					absolute >= 500 && absolute < 740
						? Math.round(
								Math.sin(
									((absolute - 500) / 48000) *
										(channel === 0 ? 440 : 660) *
										Math.PI *
										2,
								) * 10000,
							) / 32768
						: 0;
				if (pcm[index] !== expected) wrongSamples++;
			}
		}

		samples += buffer.length;
	}

	expect(samples).toBe(8000);
	expect(wrongSamples).toBe(0);
});

test.for(['wav', 'mkv'] as const)(
	'preserves canvas descendant lifetime and pitched PCM across unrelated audio boundaries in %s',
	async (container, t) => {
		if (container === 'mkv' && !supportsNativeHtmlInCanvas()) {
			t.skip();
			return;
		}

		const outputs: number[][] = [];
		for (const boundary of [false, true]) {
			const lifetime: string[] = [];
			let frames = 0;
			const result = await renderMediaOnWeb({
				licenseKey: 'free-license',
				composition: {...fractionalHtmlAudio, calculateMetadata: null},
				inputProps: {
					boundary,
					onLifetime: (event) => {
						lifetime.push(event);
					},
				},
				container,
				videoCodec: 'vp8',
				audioCodec: 'pcm-s16',
				sampleRate: 48000,
				onFrame:
					container === 'mkv'
						? (frame) => {
								expect(frame.timestamp).toBe(
									Math.round((frames / 24) * 1_000_000),
								);
								const pixels = readFrame(frame);
								let wrong = 0;
								for (let index = 0; index < pixels.length; index++) {
									if (pixels[index] !== [16, 40, 80, 255][index % 4]) wrong++;
								}

								expect(wrong).toBe(0);
								frames++;
								return frame;
							}
						: undefined,
			});
			expect(frames).toBe(container === 'mkv' ? 12 : 0);
			using input = new Input({
				formats: ALL_FORMATS,
				source: new BlobSource(await result.getBlob()),
			});
			const track = await input.getPrimaryAudioTrack();
			expect(track).not.toBeNull();
			const pcm: number[] = [];
			let samples = 0;
			for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
				for (let index = 0; index < buffer.length; index++) {
					pcm.push(
						buffer.getChannelData(0)[index],
						buffer.getChannelData(1)[index],
					);
				}

				samples += buffer.length;
			}

			expect(samples).toBe(24000);
			expect(pcm.filter((sample) => sample !== 0).length).toBeGreaterThan(1000);
			expect(lifetime).toEqual(['mount', 'unmount']);
			outputs.push(pcm);
		}

		let wrongSamples = 0;
		for (let index = 0; index < outputs[0].length; index++) {
			if (outputs[0][index] !== outputs[1][index]) wrongSamples++;
		}

		expect(wrongSamples).toBe(0);
	},
);

test.each([fractionalLoopedVideo, fractionalShortVideo])(
	'keeps every decoded video pixel independent of export audio in $id',
	async (composition) => {
		using source = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await (await fetch(fractionalRgbSource())).blob()),
		});
		const track = await source.getPrimaryVideoTrack();
		expect(track).not.toBeNull();
		const canvas = document.createElement('canvas');
		canvas.width = 64;
		canvas.height = 64;
		const context = canvas.getContext('2d')!;
		const expected: Uint8ClampedArray[] = [];
		for await (const sample of new VideoSampleSink(track!).samples()) {
			try {
				sample.draw(context, 0, 0);
				expected.push(context.getImageData(0, 0, 64, 64).data);
			} finally {
				sample.close();
			}
		}

		expect(expected).toHaveLength(3);
		for (const muted of [true, false]) {
			let captured = 0;
			await renderMediaOnWeb({
				licenseKey: 'free-license',
				composition: {...composition, calculateMetadata: null},
				inputProps: {},
				container: 'mkv',
				videoCodec: 'vp8',
				audioCodec: 'pcm-s16',
				sampleRate: 48000,
				muted,
				onFrame: (frame) => {
					expect(frame.timestamp).toBe(
						Math.round((captured / composition.fps) * 1_000_000),
					);
					const pixels = readFrame(frame);
					const reference = expected[captured % 3];
					const wrong = pixels.reduce(
						(count, value, index) => count + Number(value !== reference[index]),
						0,
					);
					expect(wrong, `frame ${captured}, export muted=${muted}`).toBe(0);
					captured++;
					return frame;
				},
			});
			expect(captured).toBe(composition.durationInFrames);
		}
	},
);

test.each(['wav', 'mkv'] as const)(
	'exports nested fractional loops without phantom audio iterations in %s',
	async (container) => {
		const result = await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {...fractionalNestedAudio, calculateMetadata: null},
			inputProps: {},
			container,
			videoCodec: 'vp8',
			audioCodec: 'pcm-s16',
			sampleRate: 48000,
		});
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		expect(track).not.toBeNull();
		let samples = 0;
		let wrong = 0;
		for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
			for (let channel = 0; channel < 2; channel++) {
				const pcm = buffer.getChannelData(channel);
				for (let i = 0; i < pcm.length; i++) {
					const offset = (samples + i) % 800;
					const expected =
						Math.round(
							Math.sin(
								(offset / 48000) * (channel === 0 ? 440 : 660) * Math.PI * 2,
							) * 10000,
						) / 32768;
					if (pcm[i] !== expected) wrong++;
				}
			}

			samples += buffer.length;
		}

		expect(samples).toBe(8000);
		expect(wrong).toBe(0);
	},
);

test('does not load an unused visual asset during fractional audio passes', async () => {
	let captured = 0;
	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {...fractionalUnusedImage, calculateMetadata: null},
		inputProps: {},
		container: 'mkv',
		videoCodec: 'vp8',
		audioCodec: 'pcm-s16',
		sampleRate: 48000,
		onFrame: (frame) => {
			const pixels = readFrame(frame);
			let wrongPixels = 0;
			for (let i = 0; i < pixels.length; i++)
				if (pixels[i] !== [16, 40, 80, 255][i % 4]) wrongPixels++;
			expect(wrongPixels).toBe(0);
			captured++;
			return frame;
		},
	});
	expect(captured).toBe(4);
	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(await result.getBlob()),
	});
	const track = await input.getPrimaryAudioTrack();
	expect(track).not.toBeNull();
	let samples = 0;
	let wrong = 0;
	for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
		for (let channel = 0; channel < 2; channel++) {
			const pcm = buffer.getChannelData(channel);
			for (let i = 0; i < pcm.length; i++) {
				const absolute = samples + i;
				const expected =
					absolute >= 500 && absolute < 740
						? Math.round(
								Math.sin(
									((absolute - 500) / 48000) *
										(channel === 0 ? 440 : 660) *
										Math.PI *
										2,
								) * 10000,
							) / 32768
						: 0;
				if (pcm[i] !== expected) wrong++;
			}
		}

		samples += buffer.length;
	}

	expect(samples).toBe(8000);
	expect(wrong).toBe(0);
});

test.each(['wav', 'mkv'] as const)(
	'excludes roundoff-only final wraps in looping Sequences for %s',
	async (container) => {
		let captured = 0;
		const options = {
			licenseKey: 'free-license' as const,
			composition: {...fractionalLoopingSequence, calculateMetadata: null},
			inputProps: {},
			container,
			videoCodec: 'vp8' as const,
			audioCodec: 'pcm-s16' as const,
			sampleRate: 48000,
			onFrame:
				container === 'mkv'
					? (frame: VideoFrame) => {
							expect(frame.timestamp).toBe(
								Math.round((captured / 24) * 1_000_000),
							);
							const pixels = readFrame(frame);
							let wrongPixels = 0;
							for (let index = 0; index < pixels.length; index++)
								if (pixels[index] !== [16, 40, 80, 255][index % 4])
									wrongPixels++;
							expect(wrongPixels).toBe(0);
							captured++;
							return frame;
						}
					: undefined,
		};
		if (container === 'mkv') {
			await renderMediaOnWeb({...options, muted: true});
			expect(captured).toBe(4);
			captured = 0;
		}

		const result = await renderMediaOnWeb(options);
		expect(captured).toBe(container === 'mkv' ? 4 : 0);
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		expect(track).not.toBeNull();
		let samples = 0;
		let wrong = 0;
		for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
			for (let channel = 0; channel < 2; channel++) {
				const pcm = buffer.getChannelData(channel);
				for (let index = 0; index < pcm.length; index++) {
					const absolute = samples + index;
					const offset = (absolute - 500) % 1400;
					const expected =
						absolute >= 500 && absolute < 4700
							? Math.round(
									Math.sin(
										(offset / 48000) *
											(channel === 0 ? 440 : 660) *
											Math.PI *
											2,
									) * 10000,
								) / 32768
							: 0;
					if (pcm[index] !== expected) wrong++;
				}
			}

			samples += buffer.length;
		}

		expect(samples).toBe(8000);
		expect(wrong).toBe(0);
	},
);

for (const unused of [true, false]) {
	test.for(['canvas', 'effects', 'animated', 'gif', 'native'] as const)(
		`defers initial %s loading with built-in ${unused ? 'wholly fractional' : 'spanning fractional'} timing until a video sample`,
		async (kind, {skip}) => {
			if (kind === 'animated' && typeof ImageDecoder === 'undefined') {
				skip();
				return;
			}

			for (const revokeEarly of [true, false]) {
				for (const muted of [true, false]) {
					let revoke: (() => void) | null = null;
					let loads = 0;
					let frames = 0;
					let wrongPixels = 0;
					const result = await renderMediaOnWeb({
						licenseKey: 'free-license',
						composition: {...fractionalTimedImage, calculateMetadata: null},
						inputProps: {
							kind,
							unused,
							revokeEarly,
							onResourceReady: (callback) => {
								revoke = callback;
							},
							onImageLoad: () => loads++,
						},
						container: 'mkv',
						videoCodec: 'vp8',
						audioCodec: 'pcm-s16',
						sampleRate: 48000,
						muted,
						onFrame: (frame) => {
							expect(frame.timestamp).toBe(
								Math.round((frames / 24) * 1_000_000),
							);
							const expected =
								!unused && frames === 1 ? [16, 40, 80, 255] : [255, 0, 0, 255];
							for (const [index, byte] of readFrame(frame).entries()) {
								if (byte !== expected[index % 4]) wrongPixels++;
							}

							if (frames === 0 && revokeEarly) {
								expect(revoke).not.toBeNull();
								revoke?.();
							}

							frames++;
							return frame;
						},
					});
					expect(frames).toBe(3);
					expect(wrongPixels).toBe(0);
					if (kind === 'gif' || kind === 'native')
						expect(loads).toBe(unused ? 0 : 1);
					const input = new Input({
						source: new BlobSource(await result.getBlob()),
						formats: ALL_FORMATS,
					});
					try {
						const track = await input.getPrimaryAudioTrack();
						if (muted) expect(track).toBeNull();
						else {
							expect(track).not.toBeNull();
							let samples = 0;
							for await (const {buffer} of new AudioBufferSink(
								track!,
							).buffers()) {
								samples += buffer.length;
								for (
									let channel = 0;
									channel < buffer.numberOfChannels;
									channel++
								) {
									expect(
										buffer
											.getChannelData(channel)
											.every((value) => value === 0),
									).toBe(true);
								}
							}

							expect(samples).toBe(6000);
						}
					} finally {
						input.dispose();
					}
				}
			}
		},
	);
}
