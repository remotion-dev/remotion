import {expect, spyOn, test} from 'bun:test';
import fs, {existsSync} from 'fs';
import os from 'os';
import path from 'path';
import {
	RenderInternals,
	openBrowser,
	renderMedia,
	selectComposition,
} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('Render video with browser instance open', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const reactSvg = await selectComposition({
		id: 'react-svg',
		serveUrl: exampleBuild,
		puppeteerInstance,
		inputProps: {},
	});

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'out.mp4');
	const originalFetch = globalThis.fetch;
	const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(((
		input,
		init,
	) => {
		if (String(input).startsWith('https://www.remotion.pro/api/track/')) {
			return Promise.resolve(
				new Response(
					JSON.stringify({
						success: true,
						billable: false,
						classification: 'development',
					}),
				),
			);
		}

		return originalFetch(input, init);
	}) as typeof fetch);
	const warnSpy = spyOn(console, 'warn').mockImplementation(() => undefined);

	try {
		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
			serveUrl: exampleBuild,
			composition: reactSvg,
			frameRange: [0, 2],
			puppeteerInstance,
			metadata: {Author: 'Lunar'},
			licenseKey: 'free-license',
			logLevel: 'warn',
		});

		expect(existsSync(outPath)).toBe(true);
		const licensingCall = fetchSpy.mock.calls.find(([input]) =>
			String(input).startsWith('https://www.remotion.pro/api/track/'),
		);
		expect(licensingCall).toBeDefined();
		expect(JSON.parse(String(licensingCall?.[1]?.body))).toMatchObject({
			apiKey: null,
			event: 'cloud-render',
			host: null,
			isStill: false,
		});
		expect(
			warnSpy.mock.calls.some((args) =>
				args.join(' ').includes('Pass "licenseKey" to renderMedia()'),
			),
		).toBe(false);
	} finally {
		fetchSpy.mockRestore();
		warnSpy.mockRestore();
		await puppeteerInstance.close({silent: false});
	}
});

test('Render video with browser instance not open', async () => {
	const warnSpy = spyOn(console, 'warn').mockImplementation(() => undefined);
	const reactSvg = await selectComposition({
		id: 'react-svg',
		serveUrl: exampleBuild,
		inputProps: {},
	});

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'subdir', 'out.mp4');

	try {
		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
			serveUrl: exampleBuild,
			composition: reactSvg,
			frameRange: [0, 2],
			metadata: {Author: 'Lunar'},
			logLevel: 'warn',
		});
		expect(existsSync(outPath)).toBe(true);
		expect(
			warnSpy.mock.calls.some((args) =>
				args.join(' ').includes('Pass "licenseKey" to renderMedia()'),
			),
		).toBe(NoReactInternals.ENABLE_V5_BREAKING_CHANGES);
	} finally {
		warnSpy.mockRestore();
	}
});

test('should fail on invalid CRF', async () => {
	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'out.mp4');
	const browserInstance = await openBrowser('chrome');

	try {
		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
			licenseKey: null,
			logLevel: 'error',
			serveUrl: exampleBuild,
			// @ts-expect-error
			crf: 'wrong',
			composition: {
				durationInFrames: 10,
				fps: 30,
				height: 1080,
				id: 'hitehre',
				width: 1080,
				defaultProps: {},
				props: {},
				defaultCodec: null,
				defaultOutName: null,
				defaultVideoImageFormat: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
				defaultSampleRate: null,
			},
			frameRange: [0, 2],
			puppeteerInstance: browserInstance,
		});
		throw new Error('render should have failed');
	} catch (err) {
		expect((err as Error).message).toMatch(
			/Expected CRF to be a number, but is "wrong"/,
		);
	}

	await browserInstance.close({silent: false});
});

test('Render video to a buffer', async () => {
	const reactSvg = await selectComposition({
		id: 'react-svg',
		serveUrl: exampleBuild,
		inputProps: {},
	});

	const {buffer, contentType} = await renderMedia({
		codec: 'h264',
		licenseKey: null,
		serveUrl: exampleBuild,
		composition: reactSvg,
		frameRange: [0, 2],
		logLevel: 'error',
	});

	expect(buffer?.length).toBeGreaterThan(2000);
	expect(contentType).toBe('video/mp4');
});

test('Render multiple frame ranges to one video', async () => {
	const composition = await selectComposition({
		id: 'ten-frame-tester',
		serveUrl: exampleBuild,
		inputProps: {},
	});

	const outputLocation = path.join(os.tmpdir(), 'multiple-frame-ranges.mp4');
	try {
		await renderMedia({
			codec: 'h264',
			licenseKey: null,
			serveUrl: exampleBuild,
			composition,
			frameRange: [
				[0, 2],
				[6, 8],
			],
			outputLocation,
			logLevel: 'error',
		});

		const probe = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [
				'-v',
				'error',
				'-count_frames',
				'-select_streams',
				'v:0',
				'-show_entries',
				'stream=nb_read_frames',
				'-of',
				'default=noprint_wrappers=1:nokey=1',
				outputLocation,
			],
			indent: false,
			logLevel: 'error',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		expect(`${probe.stdout}${probe.stderr}`.trim()).toBe('6');
	} finally {
		await fs.promises.rm(outputLocation, {force: true});
	}
});

test('Should fail invalid serve URL', async () => {
	try {
		await renderMedia({
			codec: 'h264',
			licenseKey: null,
			logLevel: 'error',
			serveUrl:
				'https://remotionlambda-gc1w0xbfzl.s3.eu-central-1.amazonaws.com/sites/Ignition-SessionResultStoryVideo/index.html',
			composition: {
				defaultProps: {},
				durationInFrames: 10,
				fps: 30,
				height: 1080,
				id: 'hitehre',
				width: 1080,
				props: {},
				defaultCodec: null,
				defaultOutName: null,
				defaultVideoImageFormat: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
				defaultSampleRate: null,
			},
		});
	} catch (err) {
		const message = (err as Error).message;
		expect(
			message.includes('Failed to load resource') ||
				message.includes('Error while getting compositions'),
		).toBe(true);
		return;
	}

	throw new Error('should have failed');
});
