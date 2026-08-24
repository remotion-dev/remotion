import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {stitchFramesToVideo} from '../stitch-frames-to-video';

test('Fast Start finalization stays off the public output path', async () => {
	const testDirectory = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-faststart-test-'),
	);
	const downloadMap = makeDownloadMap(48000);
	const frame = path.join(testDirectory, 'frame-0.png');
	await fs.promises.copyFile(
		path.join(
			__dirname,
			'..',
			'..',
			'..',
			'example',
			'public',
			'stuttgart-pin.png',
		),
		frame,
	);
	const assetsInfo = {
		assets: [
			{
				frame: 0,
				audioAndVideoAssets: [],
				artifactAssets: [],
				inlineAudioAssets: [],
			},
		],
		chunkLengthInSeconds: 1,
		downloadMap,
		firstFrameIndex: 0,
		forSeamlessAacConcatenation: false,
		imageSequenceName: path.join(testDirectory, 'frame-%d.png'),
		trimLeftOffset: 0,
		trimRightOffset: 0,
	};

	try {
		const outputPath = path.join(testDirectory, 'output.mp4');
		const observedFiles = new Set<string>();
		const watcher = fs.watch(testDirectory, (_event, filename) => {
			if (filename) {
				observedFiles.add(filename);
			}
		});
		let progressUpdates = 0;
		try {
			await stitchFramesToVideo({
				assetsInfo,
				codec: 'h264',
				force: false,
				fps: 1,
				height: 512,
				muted: true,
				onProgress: () => {
					progressUpdates++;
					expect(fs.existsSync(outputPath)).toBe(false);
				},
				outputLocation: outputPath,
				width: 512,
			});
			await new Promise((resolve) => setTimeout(resolve, 100));
		} finally {
			watcher.close();
		}

		expect(progressUpdates).toBeGreaterThan(0);
		expect(
			[...observedFiles].some(
				(filename) =>
					filename.startsWith('output.mp4.') &&
					filename.endsWith('.remotion-in-progress'),
			),
		).toBe(true);
		expect(
			(await fs.promises.readdir(testDirectory)).some((filename) =>
				filename.endsWith('.remotion-in-progress'),
			),
		).toBe(false);
		const output = await fs.promises.readFile(outputPath);
		expect(output.indexOf('moov')).toBeGreaterThan(-1);
		expect(output.indexOf('moov')).toBeLessThan(output.indexOf('mdat'));
	} finally {
		downloadMap.allowCleanup();
		cleanDownloadMap(downloadMap);
		await fs.promises.rm(testDirectory, {force: true, recursive: true});
	}
});
