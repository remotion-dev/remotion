// Combine multiple video chunks, useful for decentralized rendering

import {rmdirSync, rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import type {AudioCodec} from './audio-codec';
import {
	getDefaultAudioCodec,
	mapAudioCodecToFfmpegAudioCodecName,
} from './audio-codec';
import {callFf} from './call-ffmpeg';
import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {truthy} from './truthy';

type Options = {
	files: string[];
	filelistDir: string;
	output: string;
	onProgress: (p: number) => void;
	numberOfFrames: number;
	codec: Codec;
	fps: number;
	numberOfGifLoops: number | null;
	audioCodec: AudioCodec | null;
};

export const combineVideos = async (options: Options) => {
	const {
		files,
		filelistDir,
		output,
		onProgress,
		numberOfFrames,
		codec,
		fps,
		numberOfGifLoops,
		audioCodec,
	} = options;
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(filelistDir, 'files.txt');
	writeFileSync(fileListTxt, fileList);

	const resolvedAudioCodec =
		audioCodec ?? getDefaultAudioCodec({codec, preferLossless: false});

	try {
		const task = callFf(
			'ffmpeg',
			[
				isAudioCodec(codec) ? null : '-r',
				isAudioCodec(codec) ? null : String(fps),
				'-f',
				'concat',
				'-safe',
				'0',
				'-i',
				fileListTxt,
				numberOfGifLoops === null ? null : '-loop',
				numberOfGifLoops === null
					? null
					: typeof numberOfGifLoops === 'number'
					? String(numberOfGifLoops)
					: '-1',
				isAudioCodec(codec) ? null : '-c:v',
				isAudioCodec(codec) ? null : codec === 'gif' ? 'gif' : 'copy',
				resolvedAudioCodec ? '-c:a' : null,
				resolvedAudioCodec
					? mapAudioCodecToFfmpegAudioCodecName(resolvedAudioCodec)
					: null,
				// Set max bitrate up to 512kbps, will choose lower if that's too much
				'-b:a',
				'512K',
				codec === 'h264' ? '-movflags' : null,
				codec === 'h264' ? 'faststart' : null,
				'-y',
				output,
			].filter(truthy)
		);
		task.stderr?.on('data', (data: Buffer) => {
			if (onProgress) {
				const parsed = parseFfmpegProgress(data.toString());
				if (parsed !== undefined) {
					onProgress(parsed);
				}
			}
		});

		await task;
		onProgress(numberOfFrames);
		(rmSync ?? rmdirSync)(filelistDir, {recursive: true});
	} catch (err) {
		(rmSync ?? rmdirSync)(filelistDir, {recursive: true});
		throw err;
	}
};
