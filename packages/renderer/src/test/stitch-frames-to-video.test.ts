import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {callFf} from '../call-ffmpeg';
import type {Codec} from '../codec';
import {combineChunks} from '../combine-chunks';
import {getFastStartMuxer} from '../get-fast-start-muxer';
import {stitchFramesToVideo} from '../stitch-frames-to-video';

type Container = 'hevc' | 'mkv' | 'mov' | 'mp4' | 'mpegts' | 'webm';

const expectContainer = async (file: string, container: Container) => {
	const probe = await callFf({
		bin: 'ffprobe',
		args: [
			'-v',
			'error',
			'-show_entries',
			'format=format_name:format_tags=major_brand',
			'-of',
			'json',
			file,
		],
		indent: false,
		logLevel: 'error',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	const parsed = JSON.parse(probe.stdout) as {
		format: {format_name: string; tags?: {major_brand?: string}};
	};
	const output = await fs.promises.readFile(file);

	if (container === 'mp4' || container === 'mov') {
		expect(parsed.format.format_name).toBe('mov,mp4,m4a,3gp,3g2,mj2');
		expect(parsed.format.tags?.major_brand).toBe(
			container === 'mov' ? 'qt  ' : 'isom',
		);
		expect(output.indexOf('moov')).toBeGreaterThan(-1);
		expect(output.indexOf('moov')).toBeLessThan(output.indexOf('mdat'));
		return;
	}

	if (container === 'mkv' || container === 'webm') {
		expect(parsed.format.format_name).toBe('matroska,webm');
		expect(
			output.includes(Buffer.from(container === 'mkv' ? 'matroska' : 'webm')),
		).toBe(true);
		return;
	}

	expect(parsed.format.format_name).toBe(container);
};

const stitchVideo = async ({
	codec,
	extension,
	testDirectory,
}: {
	codec: Codec;
	extension: string;
	testDirectory: string;
}) => {
	const downloadMap = makeDownloadMap(48000);
	const output = path.join(testDirectory, `stitched-${codec}.${extension}`);
	try {
		await stitchFramesToVideo({
			assetsInfo: {
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
			},
			codec,
			force: true,
			fps: 1,
			height: 128,
			muted: true,
			outputLocation: output,
			pixelFormat: codec === 'prores' ? 'yuv422p10le' : undefined,
			width: 128,
		});
	} finally {
		downloadMap.allowCleanup();
		cleanDownloadMap(downloadMap);
	}

	return output;
};

test('Fast Start muxers are selected from the container extension', () => {
	expect(
		['mp4', 'MP4', 'mov', 'MOV', 'mkv', 'ts', 'hevc', 'webm'].map(
			getFastStartMuxer,
		),
	).toEqual(['mp4', 'mp4', 'mov', 'mov', null, null, null, null]);
});

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

test('Fast Start is selected from the output container', async () => {
	const testDirectory = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-faststart-container-test-'),
	);
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
		path.join(testDirectory, 'frame-0.png'),
	);

	try {
		const h264Mp4 = await stitchVideo({
			codec: 'h264',
			extension: 'mp4',
			testDirectory,
		});
		const h264Mkv = await stitchVideo({
			codec: 'h264',
			extension: 'mkv',
			testDirectory,
		});
		const h265Mp4 = await stitchVideo({
			codec: 'h265',
			extension: 'mp4',
			testDirectory,
		});
		const av1Mp4 = await stitchVideo({
			codec: 'av1',
			extension: 'mp4',
			testDirectory,
		});
		const proResMov = await stitchVideo({
			codec: 'prores',
			extension: 'mov',
			testDirectory,
		});

		await expectContainer(h264Mp4, 'mp4');
		await expectContainer(h264Mkv, 'mkv');
		await expectContainer(h265Mp4, 'mp4');
		await expectContainer(av1Mp4, 'mp4');
		await expectContainer(proResMov, 'mov');

		for (const {codec, container, extension, source} of [
			{codec: 'h264', container: 'mp4', extension: 'mp4', source: h264Mp4},
			{codec: 'h264', container: 'mov', extension: 'mov', source: h264Mp4},
			{codec: 'h264', container: 'mkv', extension: 'mkv', source: h264Mp4},
			{codec: 'h264', container: 'mpegts', extension: 'ts', source: h264Mp4},
			{codec: 'h265', container: 'mkv', extension: 'mkv', source: h265Mp4},
			{codec: 'h265', container: 'hevc', extension: 'hevc', source: h265Mp4},
			{codec: 'av1', container: 'mkv', extension: 'mkv', source: av1Mp4},
			{codec: 'av1', container: 'webm', extension: 'webm', source: av1Mp4},
		] as const) {
			const output = path.join(testDirectory, `combined-${codec}.${extension}`);
			await combineChunks({
				audioFiles: [],
				codec,
				compositionDurationInFrames: 1,
				fps: 1,
				framesPerChunk: 1,
				outputLocation: output,
				preferLossless: false,
				videoFiles: [source],
			});
			await expectContainer(output, container);
		}
	} finally {
		await fs.promises.rm(testDirectory, {force: true, recursive: true});
	}
});
