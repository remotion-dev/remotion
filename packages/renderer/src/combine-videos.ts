// Combine multiple video chunks, useful for decentralized rendering

import {rmSync} from 'node:fs';
import {join} from 'node:path';
import {VERSION} from 'remotion/version';
import type {AudioCodec} from './audio-codec';
import {getDefaultAudioCodec} from './audio-codec';
import {callFf} from './call-ffmpeg';
import type {Codec} from './codec';
import {createCombinedAudio} from './combine-audio';
import {combineVideoStreams} from './combine-video-streams';
import {isAudioCodec} from './is-audio-codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';
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
	audioBitrate: string | null;
	indent: boolean;
	logLevel: LogLevel;
	chunkDurationInSeconds: number;
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
		audioBitrate,
		indent,
		logLevel,
		chunkDurationInSeconds,
	} = options;

	const audioOutput = join(filelistDir, 'audio');
	const videoOutput = join(filelistDir, 'video');

	const resolvedAudioCodec =
		audioCodec ?? getDefaultAudioCodec({codec, preferLossless: false});

	const shouldCreateAudio = resolvedAudioCodec !== null;
	const shouldCreateVideo = !isAudioCodec(codec);

	if (shouldCreateAudio) {
		await createCombinedAudio({
			audioBitrate,
			filelistDir,
			files,
			indent,
			logLevel,
			output: audioOutput,
			resolvedAudioCodec,
			seamless: resolvedAudioCodec === 'aac',
			chunkDurationInSeconds,
		});
	}

	if (shouldCreateVideo) {
		await combineVideoStreams({
			codec,
			filelistDir,
			fps,
			indent,
			logLevel,
			numberOfGifLoops,
			onProgress,
			output: videoOutput,
			files,
		});
	}

	const command = [
		'-i',
		videoOutput,
		'-i',
		audioOutput,
		'-c:v',
		'copy',
		'-c:a',
		'copy',
		`-metadata`,
		`comment=Made with Remotion ${VERSION}`,
		'-y',
		output,
	].filter(truthy);

	Log.verbose({indent, logLevel}, 'Combining command: ', command);

	try {
		const task = callFf({
			bin: 'ffmpeg',
			args: command,
			indent: options.indent,
			logLevel: options.logLevel,
		});
		task.stderr?.on('data', (data: Buffer) => {
			const parsed = parseFfmpegProgress(data.toString('utf8'));
			if (parsed === undefined) {
				Log.verbose({indent, logLevel}, data.toString('utf8'));
			} else {
				Log.verbose({indent, logLevel}, `Combined ${parsed} frames`);
				onProgress(parsed);
			}
		});

		await task;
		onProgress(numberOfFrames);
		rmSync(filelistDir, {recursive: true});
	} catch (err) {
		rmSync(filelistDir, {recursive: true});
		throw err;
	}
};
