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
const PARITY_FIXTURE_ID = 'gsap-parity';

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

		browser = await openBrowser('chrome', {logLevel: 'warn'});
		composition = await selectComposition({
			serveUrl,
			id: SHOWCASE_ID,
			puppeteerInstance: browser,
		});
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
			onFrameBuffer: (buffer, frame) => {
				frames.set(frame, buffer);
			},
			logLevel: 'warn',
		});

		return frames;
	};

	it(
		'keeps showcase frames identical across concurrent, shuffled, and repeated renders',
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

			const directFrames = new Map<number, Buffer>();
			for (const frame of [...shuffledFrames, 87]) {
				const direct = await renderStill({
					serveUrl,
					composition,
					frame,
					output: null,
					imageFormat: 'png',
					puppeteerInstance: browser,
					logLevel: 'warn',
				});

				expect(
					direct.buffer,
					`direct buffer for frame ${frame}`,
				).not.toBeNull();
				directFrames.set(frame, direct.buffer!);

				if (shuffledFrames.includes(frame)) {
					const fromSequence = sequenceFrames.get(frame);
					expect(
						fromSequence,
						`sequence buffer for frame ${frame}`,
					).toBeDefined();
					expect(
						pixelDifference(fromSequence!, direct.buffer!),
						`showcase frame ${frame}`,
					).toBe(0);
				}
			}

			const repeated = await renderStill({
				serveUrl,
				composition,
				frame: 87,
				output: null,
				puppeteerInstance: browser,
				imageFormat: 'png',
				logLevel: 'warn',
			});

			expect(pixelDifference(directFrames.get(87)!, repeated.buffer!)).toBe(0);
		},
		{timeout: 120000},
	);

	it(
		'maps timeline time and boundary states consistently across frame rates and Sequences',
		async () => {
			const fps24 = await selectComposition({
				serveUrl,
				id: FPS_24_FIXTURE_ID,
				puppeteerInstance: browser,
			});
			const fps30 = await selectComposition({
				serveUrl,
				id: FPS_30_FIXTURE_ID,
				puppeteerInstance: browser,
			});
			const fps60 = await selectComposition({
				serveUrl,
				id: FPS_60_FIXTURE_ID,
				puppeteerInstance: browser,
			});
			const sequence = await selectComposition({
				serveUrl,
				id: SEQUENCE_FIXTURE_ID,
				puppeteerInstance: browser,
			});
			const nestedSequence = await selectComposition({
				serveUrl,
				id: NESTED_SEQUENCE_FIXTURE_ID,
				puppeteerInstance: browser,
			});

			const render = (
				targetComposition: Awaited<ReturnType<typeof selectComposition>>,
				frame: number,
			) =>
				renderStill({
					serveUrl,
					composition: targetComposition,
					frame,
					output: null,
					puppeteerInstance: browser,
					imageFormat: 'png',
					logLevel: 'warn',
				});

			const [
				halfSecond24,
				halfSecond30,
				halfSecond60,
				halfSecondInSequence,
				halfSecondInNestedSequence,
				start,
				midpoint,
				postDuration,
			] = await Promise.all([
				render(fps24, 12),
				render(fps30, 15),
				render(fps60, 30),
				render(sequence, 45),
				render(nestedSequence, 45),
				render(fps30, 0),
				render(fps30, 12),
				render(fps30, 59),
			]);

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
			expect(pixelAt(start.buffer!, 50, 50)).toEqual([0, 0, 0, 255]);
			expect(pixelAt(midpoint.buffer!, 50, 50)).toEqual([102, 0, 0, 255]);
			expect(pixelAt(postDuration.buffer!, 50, 50)).toEqual([255, 0, 0, 255]);
		},
		{timeout: 120000},
	);

	it(
		'keeps complex fixtures identical across serial, concurrent, and shuffled rendering',
		async () => {
			const parity = await selectComposition({
				serveUrl,
				id: PARITY_FIXTURE_ID,
				puppeteerInstance: browser,
			});
			const serial = await renderFrameMap(parity, 1);
			const concurrent = await renderFrameMap(parity, rendererConcurrency);

			expect(serial.size).toBe(parity.durationInFrames);
			expect(concurrent.size).toBe(parity.durationInFrames);

			for (let frame = 0; frame < parity.durationInFrames; frame++) {
				expect(
					pixelDifference(serial.get(frame)!, concurrent.get(frame)!),
					`parity frame ${frame} serial vs concurrent`,
				).toBe(0);
			}

			for (const frame of [84, 30, 9, 64, 10, 45, 29, 23, 16, 44, 0, 59, 15]) {
				const direct = await renderStill({
					serveUrl,
					composition: parity,
					frame,
					output: null,
					puppeteerInstance: browser,
					imageFormat: 'png',
					logLevel: 'warn',
				});

				expect(
					pixelDifference(concurrent.get(frame)!, direct.buffer!),
					`parity frame ${frame} concurrent vs direct`,
				).toBe(0);
			}
		},
		{timeout: 240000},
	);
});
