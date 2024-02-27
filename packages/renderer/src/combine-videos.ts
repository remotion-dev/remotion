// Combine multiple video chunks, useful for decentralized rendering

import {rmSync} from 'node:fs';
import {join} from 'node:path';
import type {AudioCodec} from './audio-codec';
import {getDefaultAudioCodec} from './audio-codec';
import type {Codec} from './codec';
import {createCombinedAudio} from './combine-audio';
import {combineVideoStreams} from './combine-video-streams';
import {getExtensionFromAudioCodec} from './get-extension-from-audio-codec';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {isAudioCodec} from './is-audio-codec';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
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
	cancelSignal: CancelSignal | undefined;
};

export const combineVideos = async ({
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
	cancelSignal,
}: Options) => {
	// TODO: onProgress is now reused across 3 functions

	const resolvedAudioCodec =
		audioCodec ?? getDefaultAudioCodec({codec, preferLossless: false});

	const shouldCreateAudio = resolvedAudioCodec !== null;
	const shouldCreateVideo = !isAudioCodec(codec);

	const videoOutput = join(
		filelistDir,
		`video.${getFileExtensionFromCodec(codec, resolvedAudioCodec)}`,
	);

	const audioOutput = shouldCreateAudio
		? join(
				filelistDir,
				`audio.${getExtensionFromAudioCodec(resolvedAudioCodec)}`,
			)
		: null;

	const audioFiles = files.filter((f) => f.endsWith('audio'));
	const videoFiles = files.filter((f) => f.endsWith('video'));

	if (shouldCreateAudio) {
		await createCombinedAudio({
			audioBitrate,
			filelistDir,
			files: audioFiles,
			indent,
			logLevel,
			output: shouldCreateVideo ? (audioOutput as string) : output,
			resolvedAudioCodec,
			seamless: resolvedAudioCodec === 'aac',
			chunkDurationInSeconds,
			addRemotionMetadata: !shouldCreateVideo,
			binariesDirectory,
			fps,
			cancelSignal,
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
			files: videoFiles,
			addRemotionMetadata: !shouldCreateAudio,
			binariesDirectory,
			cancelSignal,
		});
	}

	if (!(audioOutput && shouldCreateVideo)) {
		rmSync(filelistDir, {recursive: true});
		return;
	}

	try {
		await muxVideoAndAudio({
			audioOutput,
			indent,
			logLevel,
			onProgress,
			output,
			videoOutput,
			binariesDirectory,
			fps,
			cancelSignal,
		});
		onProgress(numberOfFrames);
		rmSync(filelistDir, {recursive: true});
	} catch (err) {
		rmSync(filelistDir, {recursive: true});
		throw err;
	}
};
