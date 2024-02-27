// Combine multiple video chunks, useful for decentralized rendering

import {rmSync} from 'node:fs';
import {join} from 'node:path';
import {RenderInternals} from '.';
import type {AudioCodec} from './audio-codec';
import {getDefaultAudioCodec} from './audio-codec';
import type {Codec} from './codec';
import {createCombinedAudio} from './combine-audio';
import {combineVideoStreams} from './combine-video-streams';
import {isAudioCodec} from './is-audio-codec';
import type {LogLevel} from './log-level';
import {muxVideoAndAudio} from './mux-video-and-audio';

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
	binariesDirectory: string | null;
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
		binariesDirectory,
	} = options;

	// TODO: onProgress is now reused across 3 functions

	const resolvedAudioCodec =
		audioCodec ?? getDefaultAudioCodec({codec, preferLossless: false});

	const shouldCreateAudio = resolvedAudioCodec !== null;
	const shouldCreateVideo = !isAudioCodec(codec);

	const newLocal = shouldCreateAudio
		? `audio.${
				resolvedAudioCodec === 'pcm-16'
					? 'wav'
					: resolvedAudioCodec === 'opus'
						? 'opus'
						: RenderInternals.getFileExtensionFromCodec(
								resolvedAudioCodec,
								null,
							)
			}`
		: null;
	const audioOutput = newLocal ? join(filelistDir, newLocal) : null;
	const videoOutput = join(
		filelistDir,
		'video.' +
			RenderInternals.getFileExtensionFromCodec(codec, resolvedAudioCodec),
	);

	if (shouldCreateAudio) {
		await createCombinedAudio({
			audioBitrate,
			filelistDir,
			files,
			indent,
			logLevel,
			output: shouldCreateVideo && audioOutput ? audioOutput : output,
			resolvedAudioCodec,
			seamless: resolvedAudioCodec === 'aac',
			chunkDurationInSeconds,
			addRemotionMetadata: !shouldCreateVideo,
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
			output: shouldCreateAudio ? videoOutput : output,
			files,
			addRemotionMetadata: !shouldCreateAudio,
		});
	}

	if (!(shouldCreateAudio && shouldCreateVideo)) {
		rmSync(filelistDir, {recursive: true});
		return;
	}

	try {
		await muxVideoAndAudio({
			audioOutput: audioOutput as string,
			indent,
			logLevel,
			onProgress,
			output,
			videoOutput,
		});
		onProgress(numberOfFrames);
		rmSync(filelistDir, {recursive: true});
	} catch (err) {
		rmSync(filelistDir, {recursive: true});
		throw err;
	}
};
