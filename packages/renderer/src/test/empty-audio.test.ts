import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {AudioOrVideoAsset, InlineAudioAsset} from 'remotion/no-react';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {callFf} from '../call-ffmpeg';
import type {Codec} from '../codec';
import {stitchFramesToVideo} from '../stitch-frames-to-video';

test(
	'Video exports omit absent audio unless an audio track is enforced',
	async () => {
		const directory = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), 'remotion-empty-audio-'),
		);
		const sourceVideo = path.join(directory, 'source.mp4');
		const examplePublic = path.join(__dirname, '../../../example/public');
		const ffmpegOptions = {
			indent: false,
			logLevel: 'error',
			binariesDirectory: null,
			cancelSignal: undefined,
		} as const;

		try {
			await fs.promises.copyFile(
				path.join(examplePublic, 'stuttgart-pin.png'),
				path.join(directory, 'frame-0.png'),
			);
			await callFf({
				...ffmpegOptions,
				bin: 'ffmpeg',
				args: [
					'-framerate',
					'1',
					'-i',
					path.join(directory, 'frame-0.png'),
					'-an',
					'-c:v',
					'libx264',
					'-pix_fmt',
					'yuv420p',
					sourceVideo,
				],
			});

			for (const scenario of [
				{
					name: 'empty',
					source: null,
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'artifact',
					source: null,
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'video-without-audio',
					source: sourceVideo,
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'audio',
					source: path.join(examplePublic, 'audio-48000hz.wav'),
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'inline',
					source: null,
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'enforced-empty',
					source: null,
					enforced: true,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'enforced-video',
					source: sourceVideo,
					enforced: true,
					muted: false,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'muted',
					source: null,
					enforced: true,
					muted: true,
					codec: 'h264',
					separate: false,
				},
				{
					name: 'audio-only',
					source: null,
					enforced: false,
					muted: false,
					codec: 'wav',
					separate: false,
				},
				{
					name: 'separate-empty',
					source: null,
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: true,
				},
				{
					name: 'separate-enforced',
					source: null,
					enforced: true,
					muted: false,
					codec: 'h264',
					separate: true,
				},
				{
					name: 'separate-video',
					source: sourceVideo,
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: true,
				},
				{
					name: 'separate-audio',
					source: path.join(examplePublic, 'audio-48000hz.wav'),
					enforced: false,
					muted: false,
					codec: 'h264',
					separate: true,
				},
				{
					name: 'separate-muted',
					source: null,
					enforced: false,
					muted: true,
					codec: 'h264',
					separate: true,
				},
			] satisfies {
				name: string;
				source: string | null;
				enforced: boolean;
				muted: boolean;
				codec: Codec;
				separate: boolean;
			}[]) {
				const downloadMap = makeDownloadMap(48000);
				const output = path.join(
					directory,
					`${scenario.name}.${scenario.codec === 'wav' ? 'wav' : 'mp4'}`,
				);
				const separateAudioTo = scenario.separate
					? path.join(directory, `${scenario.name}.wav`)
					: null;
				const audioAndVideoAssets: AudioOrVideoAsset[] =
					scenario.source === null
						? []
						: [
								{
									type: scenario.source === sourceVideo ? 'video' : 'audio',
									src: `data:${scenario.source === sourceVideo ? 'video/mp4' : 'audio/wav'};base64,${fs.readFileSync(scenario.source).toString('base64')}`,
									id: 'source',
									frame: 0,
									mediaFrame: 0,
									volume: 1,
									playbackRate: 1,
									toneFrequency: 1,
									audioStartFrame: 0,
									audioStreamIndex: 0,
								},
							];
				const inlineAudioAssets: InlineAudioAsset[] =
					scenario.name === 'inline'
						? [
								{
									type: 'inline-audio',
									id: 'inline',
									frame: 0,
									startInVideo: 0,
									timestamp: 0,
									duration: 1,
									toneFrequency: 1,
									audio: new Int16Array(96000).fill(1000),
								},
							]
						: [];
				try {
					for (const asset of inlineAudioAssets) {
						downloadMap.inlineAudioMixing.addAsset({
							asset,
							fps: 1,
							totalNumberOfFrames: 1,
							firstFrame: 0,
							trimLeftOffset: 0,
							trimRightOffset: 0,
						});
					}

					const render = stitchFramesToVideo({
						assetsInfo: {
							assets: [
								{
									frame: 0,
									audioAndVideoAssets,
									inlineAudioAssets,
									artifactAssets:
										scenario.name === 'artifact'
											? [{frame: 0, filename: 'report.txt'}]
											: [],
								},
							],
							chunkLengthInSeconds: 1,
							downloadMap,
							firstFrameIndex: 0,
							forSeamlessAacConcatenation: false,
							imageSequenceName: path.join(directory, 'frame-%d.png'),
							trimLeftOffset: 0,
							trimRightOffset: 0,
						},
						codec: scenario.codec,
						fps: 1,
						height: 512,
						width: 512,
						enforceAudioTrack: scenario.enforced,
						muted: scenario.muted,
						outputLocation: output,
						separateAudioTo,
						audioCodec:
							scenario.separate || scenario.codec === 'wav' ? 'pcm-16' : 'aac',
					});

					if (scenario.name === 'separate-muted') {
						await expect(render).rejects.toThrow('Audio output is disabled');
						expect(fs.existsSync(output)).toBe(false);
						expect(fs.existsSync(separateAudioTo as string)).toBe(false);
						continue;
					}

					await render;
					const probe = await callFf({
						...ffmpegOptions,
						bin: 'ffprobe',
						args: [
							'-v',
							'error',
							'-show_entries',
							'stream=codec_type',
							'-of',
							'json',
							output,
						],
					});
					const {streams} = JSON.parse(probe.stdout) as {
						streams: {codec_type: string}[];
					};
					const hasSourceAudio =
						(scenario.source !== null && scenario.source !== sourceVideo) ||
						scenario.name === 'inline';
					const hasAudio =
						!scenario.muted &&
						(scenario.enforced ||
							hasSourceAudio ||
							scenario.codec === 'wav' ||
							scenario.separate);
					expect(
						streams.map((stream) => stream.codec_type),
						scenario.name,
					).toEqual([
						...(scenario.codec === 'wav' ? [] : ['video']),
						...(hasAudio && !scenario.separate ? ['audio'] : []),
					]);
					if (hasAudio) {
						const pcm = path.join(directory, `${scenario.name}-decoded.wav`);
						await callFf({
							...ffmpegOptions,
							bin: 'ffmpeg',
							args: [
								'-i',
								separateAudioTo ?? output,
								'-map',
								'0:a:0',
								'-c:a',
								'pcm_s16le',
								pcm,
							],
						});
						const wav = await fs.promises.readFile(pcm);
						const dataOffset = wav.indexOf('data');
						expect(dataOffset).toBeGreaterThan(0);
						const samples = wav.subarray(dataOffset + 8);
						expect(samples.length).toBeGreaterThan(0);
						expect(
							samples.some((sample) => sample !== 0),
							scenario.name,
						).toBe(hasSourceAudio);
					}
				} finally {
					downloadMap.allowCleanup();
					cleanDownloadMap(downloadMap);
				}
			}
		} finally {
			await fs.promises.rm(directory, {recursive: true, force: true});
		}
	},
	{timeout: 30000},
);
