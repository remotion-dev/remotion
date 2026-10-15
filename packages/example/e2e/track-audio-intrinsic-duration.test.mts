import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('Track waits for audio metadata, displays intrinsic lengths, and rejects real overlaps', async ({
	page,
}) => {
	test.setTimeout(90_000);
	const fixture = path.join(
		exampleDir,
		'src',
		'TrackAudioIntrinsicDurationE2e.tsx',
	);
	const original = fs.readFileSync(fixture, 'utf8');

	// A real 0.2-second PCM WAV: six frames at 30 fps. Keep metadata parsing
	// and all Remotion code real, controlling only the external HTTP response.
	const wav = Buffer.alloc(44 + 1600 * 2);
	wav.write('RIFF', 0);
	wav.writeUInt32LE(wav.length - 8, 4);
	wav.write('WAVEfmt ', 8);
	wav.writeUInt32LE(16, 16);
	wav.writeUInt16LE(1, 20);
	wav.writeUInt16LE(1, 22);
	wav.writeUInt32LE(8000, 24);
	wav.writeUInt32LE(16000, 28);
	wav.writeUInt16LE(2, 32);
	wav.writeUInt16LE(16, 34);
	wav.write('data', 36);
	wav.writeUInt32LE(wav.length - 44, 40);

	let releaseMetadata: () => void = () => undefined;
	const metadataReady = new Promise<void>((resolve) => {
		releaseMetadata = resolve;
	});
	let requested = false;
	await page.route('https://example.com/track-duration.wav', async (route) => {
		requested = true;
		await metadataReady;
		await route.fulfill({
			contentType: 'audio/wav',
			headers: {'Access-Control-Allow-Origin': '*'},
			body: wav,
		});
	});

	const first = page.getByRole('group', {name: 'First sound', exact: true});
	const second = page.getByRole('group', {name: 'Second sound', exact: true});
	const overlapError = page
		.getByText(/^<Track name="Sound effects"> contains overlapping items:/)
		.first();

	try {
		await startStudio();
		await page.goto(`${STUDIO_URL}/track-audio-intrinsic-duration`);
		await expect(page.getByText('Audio metadata fixture')).toBeVisible();
		await expect.poll(() => requested).toBe(true);
		await expect(
			page.getByRole('group', {name: 'Sound effects', exact: true}),
		).toBeVisible();
		await expect(first).toHaveCount(0);
		await expect(second).toHaveCount(0);
		await expect(overlapError).toHaveCount(0);

		releaseMetadata();
		await expect(first).toBeVisible();
		await expect(second).toBeVisible();
		const firstBounds = await first.boundingBox();
		const secondBounds = await second.boundingBox();
		if (firstBounds === null || secondBounds === null) {
			throw new Error('Expected both audio bars after metadata loaded');
		}

		const pixelsPerFrame = (secondBounds.x - firstBounds.x) / 30;
		expect(firstBounds.width / pixelsPerFrame).toBeCloseTo(6, 1);
		expect(secondBounds.width / pixelsPerFrame).toBeCloseTo(6, 1);
		expect(firstBounds.y).toBe(secondBounds.y);
		expect(firstBounds.x + firstBounds.width).toBeLessThan(secondBounds.x);
		await expect(overlapError).toHaveCount(0);

		fs.writeFileSync(
			fixture,
			original.replace('secondFrom = 30', 'secondFrom = 3'),
		);
		await expect(overlapError).toContainText(
			'"First sound" (frames 0–6) and "Second sound" (frames 3–9) overlap by 3 frames',
		);

		fs.writeFileSync(fixture, original);
		await expect(overlapError).toHaveCount(0);
		await expect(second).toBeVisible();
		await expect
			.poll(async () => (await second.boundingBox())?.x)
			.toBeCloseTo(secondBounds.x, 1);
	} finally {
		releaseMetadata();
		await page.close();
		await stopStudio();
		fs.writeFileSync(fixture, original);
	}
});
