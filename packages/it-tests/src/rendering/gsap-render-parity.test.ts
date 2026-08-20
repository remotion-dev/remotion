import {afterAll, beforeAll, describe, expect, it} from 'bun:test';
import {availableParallelism} from 'node:os';
import path from 'node:path';
import {
	openBrowser,
	renderFrames,
	renderStill,
	selectComposition,
	type HeadlessBrowser,
} from '@remotion/renderer';
import execa from 'execa';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const SHOWCASE_ID = 'gsap-showcase';
const FPS_24_FIXTURE_ID = 'gsap-fps-24';
const FPS_30_FIXTURE_ID = 'gsap-fps-30';
const FPS_60_FIXTURE_ID = 'gsap-fps-60';
const SEQUENCE_FIXTURE_ID = 'gsap-sequence';
const NESTED_SEQUENCE_FIXTURE_ID = 'gsap-nested-sequence';
const SURFACE_FIXTURE_ID = 'gsap-surface';
const OVERLAP_FIXTURE_ID = 'gsap-overlap';
const SAME_PROPERTY_OVERLAP_FIXTURE_ID = 'gsap-same-property-overlap';
const SVG_ROOT_FIXTURE_ID = 'gsap-svg-root';

const exampleDir = path.resolve(__dirname, '..', '..', '..', 'example');
const serveUrl = path.join(exampleDir, 'build');
const shuffledFrames = [105, 0, 195, 45, 150, 15, 75];
const rendererConcurrency = Math.min(8, availableParallelism());

// pixelmatch's types do not accept Buffer directly
const asUint8Array = (data: Buffer) =>
	new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

const pixelDifference = (leftBuffer: Buffer, rightBuffer: Buffer) => {
	const left = PNG.sync.read(leftBuffer);
	const right = PNG.sync.read(rightBuffer);

	expect(right.width).toBe(left.width);
	expect(right.height).toBe(left.height);

	return pixelmatch(
		asUint8Array(left.data),
		asUint8Array(right.data),
		undefined,
		left.width,
		left.height,
		{threshold: 0},
	);
};

const pixelAt = (buffer: Buffer, x: number, y: number) => {
	const png = PNG.sync.read(buffer);
	const offset = (y * png.width + x) * 4;
	return [...png.data.subarray(offset, offset + 4)];
};

describe('GSAP renderer parity', () => {
	let composition: Awaited<ReturnType<typeof selectComposition>>;
	let browser: HeadlessBrowser;

	beforeAll(async () => {
		// In CI, the example project is already bundled.
		if (!process.env.CI) {
			await execa('bun', ['x', 'remotion', 'bundle'], {
				cwd: exampleDir,
			});
		}

		composition = await selectComposition({serveUrl, id: SHOWCASE_ID});
		browser = await openBrowser('chrome', {logLevel: 'warn'});
	});

	afterAll(async () => {
		await browser?.close({silent: false});
	});

	const renderFrameMap = async (
		targetComposition: Awaited<ReturnType<typeof selectComposition>>,
		concurrency: number,
	) => {
		const frames = new Map<number, Buffer>();

		await renderFrames({
			serveUrl,
			composition: targetComposition,
			inputProps: {},
			outputDir: null,
			imageFormat: 'png',
			frameRange: [0, targetComposition.durationInFrames - 1],
			everyNthFrame: 1,
			concurrency,
			puppeteerInstance: browser,
			onStart: () => undefined,
			onFrameUpdate: () => undefined,
			onFrameBuffer: (buffer, frame) => frames.set(frame, buffer),
			logLevel: 'warn',
		});

		return frames;
	};

	it(
		'matches concurrent sequence rendering with shuffled direct-frame rendering',
		async () => {
			const sequenceFrames = new Map<number, Buffer>();

			await renderFrames({
				serveUrl,
				composition,
				inputProps: {},
				outputDir: null,
				imageFormat: 'png',
				frameRange: [0, composition.durationInFrames - 1],
				everyNthFrame: 15,
				concurrency: Math.min(4, rendererConcurrency),
				puppeteerInstance: browser,
				onStart: () => undefined,
				onFrameUpdate: () => undefined,
				onFrameBuffer: (buffer, frame) => {
					sequenceFrames.set(frame, buffer);
				},
				logLevel: 'warn',
			});

			for (const frame of shuffledFrames) {
				const direct = await renderStill({
					serveUrl,
					composition,
					frame,
					output: null,
					imageFormat: 'png',
					puppeteerInstance: browser,
					logLevel: 'warn',
				});

				const fromSequence = sequenceFrames.get(frame);
				expect(
					fromSequence,
					`sequence buffer for frame ${frame}`,
				).toBeDefined();
				expect(
					direct.buffer,
					`direct buffer for frame ${frame}`,
				).not.toBeNull();
				const difference = pixelDifference(fromSequence!, direct.buffer!);
				expect(difference, `showcase frame ${frame}`).toBe(0);
			}
		},
		{timeout: 120000},
	);

	it(
		'repeated direct renders of the same frame are pixel-identical',
		async () => {
			const first = await renderStill({
				serveUrl,
				composition,
				frame: 87,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});
			const second = await renderStill({
				serveUrl,
				composition,
				frame: 87,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});

			expect(pixelDifference(first.buffer!, second.buffer!)).toBe(0);
		},
		{timeout: 60000},
	);

	it(
		'maps equal local time to equal pixels at 30fps, 60fps, and inside a Sequence',
		async () => {
			const fps24 = await selectComposition({serveUrl, id: FPS_24_FIXTURE_ID});
			const fps30 = await selectComposition({serveUrl, id: FPS_30_FIXTURE_ID});
			const fps60 = await selectComposition({serveUrl, id: FPS_60_FIXTURE_ID});
			const sequence = await selectComposition({
				serveUrl,
				id: SEQUENCE_FIXTURE_ID,
			});
			const nestedSequence = await selectComposition({
				serveUrl,
				id: NESTED_SEQUENCE_FIXTURE_ID,
			});

			const halfSecond24 = await renderStill({
				serveUrl,
				composition: fps24,
				frame: 12,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});
			const halfSecond30 = await renderStill({
				serveUrl,
				composition: fps30,
				frame: 15,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});
			const halfSecond60 = await renderStill({
				serveUrl,
				composition: fps60,
				frame: 30,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});
			const halfSecondInSequence = await renderStill({
				serveUrl,
				composition: sequence,
				frame: 45,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});
			const halfSecondInNestedSequence = await renderStill({
				serveUrl,
				composition: nestedSequence,
				frame: 45,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});

			expect(pixelDifference(halfSecond24.buffer!, halfSecond30.buffer!)).toBe(
				0,
			);
			expect(pixelDifference(halfSecond30.buffer!, halfSecond60.buffer!)).toBe(
				0,
			);
			expect(
				pixelDifference(halfSecond30.buffer!, halfSecondInSequence.buffer!),
			).toBe(0);
			expect(
				pixelDifference(
					halfSecond30.buffer!,
					halfSecondInNestedSequence.buffer!,
				),
			).toBe(0);
		},
		{timeout: 120000},
	);

	it(
		'renders exact start, midpoint, and post-duration states',
		async () => {
			const fps30 = await selectComposition({serveUrl, id: FPS_30_FIXTURE_ID});
			const frames = await Promise.all(
				[0, 12, 59].map(async (frame) =>
					renderStill({
						serveUrl,
						composition: fps30,
						frame,
						output: null,
						puppeteerInstance: browser,
						imageFormat: 'png',
						logLevel: 'warn',
					}),
				),
			);

			expect(pixelAt(frames[0]!.buffer!, 50, 50)).toEqual([0, 0, 0, 255]);
			expect(pixelAt(frames[1]!.buffer!, 50, 50)).toEqual([102, 0, 0, 255]);
			expect(pixelAt(frames[2]!.buffer!, 50, 50)).toEqual([255, 0, 0, 255]);
		},
		{timeout: 60000},
	);

	it(
		'matches every complex-surface frame between serial and concurrent rendering',
		async () => {
			const surface = await selectComposition({
				serveUrl,
				id: SURFACE_FIXTURE_ID,
			});
			const serial = await renderFrameMap(surface, 1);
			const concurrent = await renderFrameMap(surface, rendererConcurrency);

			expect(serial.size).toBe(surface.durationInFrames);
			expect(concurrent.size).toBe(surface.durationInFrames);

			for (let frame = 0; frame < surface.durationInFrames; frame++) {
				expect(
					pixelDifference(serial.get(frame)!, concurrent.get(frame)!),
					`surface frame ${frame}`,
				).toBe(0);
			}
		},
		{timeout: 240000},
	);

	it(
		'keeps overlapping scoped Sequences deterministic under shuffled access',
		async () => {
			const overlap = await selectComposition({
				serveUrl,
				id: OVERLAP_FIXTURE_ID,
			});
			const rendered = await renderFrameMap(overlap, rendererConcurrency);

			for (const frame of [84, 30, 9, 64, 10, 45, 29]) {
				const direct = await renderStill({
					serveUrl,
					composition: overlap,
					frame,
					output: null,
					puppeteerInstance: browser,
					imageFormat: 'png',
					logLevel: 'warn',
				});

				expect(pixelDifference(rendered.get(frame)!, direct.buffer!)).toBe(0);
			}
		},
		{timeout: 240000},
	);

	it(
		'keeps overlapping same-property tweens identical across stills, serial and concurrent renders',
		async () => {
			const contested = await selectComposition({
				serveUrl,
				id: SAME_PROPERTY_OVERLAP_FIXTURE_ID,
			});
			const serial = await renderFrameMap(contested, 1);
			const concurrent = await renderFrameMap(contested, rendererConcurrency);

			for (const frame of [23, 16, 44, 0, 59]) {
				const direct = await renderStill({
					serveUrl,
					composition: contested,
					frame,
					output: null,
					puppeteerInstance: browser,
					imageFormat: 'png',
					logLevel: 'warn',
				});

				expect(
					pixelDifference(serial.get(frame)!, direct.buffer!),
					`contested frame ${frame} still vs serial`,
				).toBe(0);
				expect(
					pixelDifference(serial.get(frame)!, concurrent.get(frame)!),
					`contested frame ${frame} serial vs concurrent`,
				).toBe(0);
			}
		},
		{timeout: 240000},
	);

	it(
		'supports an SVG element as the timeline scope root',
		async () => {
			const svg = await selectComposition({serveUrl, id: SVG_ROOT_FIXTURE_ID});
			const direct = await renderStill({
				serveUrl,
				composition: svg,
				frame: 15,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});
			const repeated = await renderStill({
				serveUrl,
				composition: svg,
				frame: 15,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});

			expect(pixelDifference(direct.buffer!, repeated.buffer!)).toBe(0);
		},
		{timeout: 60000},
	);
});
