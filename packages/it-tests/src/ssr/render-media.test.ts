import {getCompositions, openBrowser, renderMedia} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {existsSync} from 'fs';
import os from 'os';
import path from 'path';

test('Render video with browser instance open', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const compositions = await getCompositions(
		'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		{
			puppeteerInstance,
			inputProps: {},
		},
	);

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'out.mp4');

	await renderMedia({
		outputLocation: outPath,
		codec: 'h264',
		serveUrl:
			'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		composition: reactSvg,
		frameRange: [0, 2],
		puppeteerInstance,
		metadata: {Author: 'Lunar'},
	});
	await puppeteerInstance.close({silent: false});
	expect(existsSync(outPath)).toBe(true);
});

test('Render video with browser instance not open', async () => {
	const compositions = await getCompositions(
		'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
	);

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'subdir', 'out.mp4');

	await renderMedia({
		outputLocation: outPath,
		codec: 'h264',
		serveUrl:
			'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		composition: reactSvg,
		frameRange: [0, 2],
		metadata: {Author: 'Lunar'},
	});
	expect(existsSync(outPath)).toBe(true);
});

test('should fail on invalid CRF', async () => {
	const tmpDir = os.tmpdir();

	const outPath = path.join(tmpDir, 'out.mp4');
	const browserInstance = await openBrowser('chrome');

	try {
		await renderMedia({
			outputLocation: outPath,
			codec: 'h264',
			serveUrl:
				'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
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
	const compositions = await getCompositions(
		'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
	);

	const reactSvg = compositions.find((c) => c.id === 'react-svg');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const {buffer} = await renderMedia({
		codec: 'h264',
		serveUrl:
			'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		composition: reactSvg,
		frameRange: [0, 2],
	});

	expect(buffer?.length).toBeGreaterThan(2000);
});

test('Should fail invalid serve URL', async () => {
	try {
		await renderMedia({
			codec: 'h264',
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
