// Combine multiple video chunks, useful for decentralized rendering

import {rmSync} from 'node:fs';
import {join} from 'node:path';
import {
	canConcatAudioSeamlessly,
	canConcatVideoSeamlessly,
} from './can-concat-seamlessly';
import type {Codec} from './codec';
import {createCombinedAudio} from './combine-audio';
import {combineVideoStreams} from './combine-video-streams';
import {combineVideoStreamsSeamlessly} from './combine-video-streams-seamlessly';
import type {FrameRange} from './frame-range';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getRealFrameRange} from './get-frame-to-render';
import {isAudioCodec} from './is-audio-codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {muxVideoAndAudio} from './mux-video-and-audio';
import type {AudioCodec} from './options/audio-codec';
import {
	getExtensionFromAudioCodec,
	resolveAudioCodec,
} from './options/audio-codec';
import {tmpDir} from './tmp-dir';
import {truthy} from './truthy';

type MandatoryCombineChunksOptions = {
	outputLocation: string;
	audioFiles: string[];
	codec: Codec;
	videoFiles: string[];
	fps: number;
	framesPerChunk: number;
	preferLossless: boolean;
	compositionDurationInFrames: number;
};

type CombineChunksProgress = {
	totalProgress: number;
	frames: number;
};

export type CombineChunksOnProgress = (options: CombineChunksProgress) => void;

type OptionalCombineChunksOptions = {
	onProgress: CombineChunksOnProgress;
	audioBitrate: string | null;
	numberOfGifLoops: number | null;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	audioCodec: AudioCodec | null;
	cancelSignal: CancelSignal | undefined;
	metadata: Record<string, string> | null;
	frameRange: FrameRange | null;
	everyNthFrame: number;
};

type AllCombineChunksOptions = MandatoryCombineChunksOptions &
	OptionalCombineChunksOptions;

export type CombineChunksOptions = MandatoryCombineChunksOptions &
	Partial<OptionalCombineChunksOptions>;

const codecSupportsFastStart: {[key in Codec]: boolean} = {
	'h264-mkv': false,
	'h264-ts': false,
	h264: true,
	h265: true,
	aac: false,
	gif: false,
	mp3: false,
	prores: false,
	vp8: false,
	vp9: false,
	wav: false,
};

const REMOTION_FILELIST_TOKEN = 'remotion-filelist';

export const internalCombineChunks = async ({
	outputLocation: output,
	onProgress,
	codec,
	fps,
	numberOfGifLoops,
	audioBitrate,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
	metadata,
	audioFiles,
	videoFiles,
	framesPerChunk,
	audioCodec,
	preferLossless,
	everyNthFrame,
	frameRange,
	compositionDurationInFrames,
}: AllCombineChunksOptions & {
	indent: boolean;
}) => {
	const filelistDir = tmpDir(REMOTION_FILELIST_TOKEN);

	const shouldCreateVideo = !isAudioCodec(codec);

	const resolvedAudioCodec = resolveAudioCodec({
		setting: audioCodec,
		codec,
		preferLossless,
		separateAudioTo: null,
	});

	const shouldCreateAudio =
		resolvedAudioCodec !== null && audioFiles.length > 0;

	const seamlessVideo = canConcatVideoSeamlessly(codec);
	const seamlessAudio = canConcatAudioSeamlessly(
		resolvedAudioCodec,
		framesPerChunk,
	);

	const realFrameRange = getRealFrameRange(
		compositionDurationInFrames,
		frameRange,
	);

	const numberOfFrames = getFramesToRender(
		realFrameRange,
		everyNthFrame,
	).length;

	const videoOutput = shouldCreateVideo
		? join(
				filelistDir,
				`video.${getFileExtensionFromCodec(codec, resolvedAudioCodec)}`,
			)
		: null;

	const audioOutput = shouldCreateAudio
		? join(
				filelistDir,
				`audio.${getExtensionFromAudioCodec(resolvedAudioCodec)}`,
			)
		: null;

	const chunkDurationInSeconds = framesPerChunk / fps;

	let concatenatedAudio = 0;
	let concatenatedVideo = 0;
	let muxing = 0;

	const updateProgress = () => {
		const totalFrames =
			(shouldCreateAudio ? numberOfFrames : 0) +
			(shouldCreateVideo ? numberOfFrames : 0) +
			numberOfFrames;
		const actualProgress = concatenatedAudio + concatenatedVideo + muxing;

		onProgress({
			frames: (actualProgress / totalFrames) * numberOfFrames,
			totalProgress: actualProgress / totalFrames,
		});
	};

	Log.verbose(
		{indent, logLevel},
		`Combining chunks, audio = ${
			shouldCreateAudio === false
				? 'no'
				: seamlessAudio
					? 'seamlessly'
					: 'normally'
		}, video = ${
			shouldCreateVideo === false
				? 'no'
				: seamlessVideo
					? 'seamlessly'
					: 'normally'
		}`,
	);
	await Promise.all(
		[
			shouldCreateAudio && audioOutput
				? createCombinedAudio({
						audioBitrate,
						filelistDir,
						files: audioFiles,
						indent,
						logLevel,
						output: audioOutput,
						resolvedAudioCodec,
						seamless: seamlessAudio,
						chunkDurationInSeconds,
						addRemotionMetadata: !shouldCreateVideo,
						binariesDirectory,
						fps,
						cancelSignal,
						onProgress: (frames) => {
							concatenatedAudio = frames;
							updateProgress();
						},
					})
				: null,

			shouldCreateVideo && !seamlessVideo && videoOutput
				? combineVideoStreams({
						codec,
						filelistDir,
						fps,
						indent,
						logLevel,
						numberOfGifLoops,
						output: videoOutput,
						files: videoFiles,
						addRemotionMetadata: !shouldCreateAudio,
						binariesDirectory,
						cancelSignal,
						onProgress: (frames) => {
							concatenatedVideo = frames;
							updateProgress();
						},
					})
				: null,
		].filter(truthy),
	);

	try {
		await muxVideoAndAudio({
			audioOutput,
			indent,
			logLevel,
			onProgress: (frames) => {
				muxing = frames;
				updateProgress();
			},
			output,
			videoOutput: seamlessVideo
				? combineVideoStreamsSeamlessly({files: videoFiles})
				: videoOutput,
			binariesDirectory,
			fps,
			cancelSignal,
			addFaststart: codecSupportsFastStart[codec],
			metadata,
		});
		onProgress({totalProgress: 1, frames: numberOfFrames});
		rmSync(filelistDir, {recursive: true});
	} catch (err) {
		rmSync(filelistDir, {recursive: true});
		throw err;
	}
};

export const combineChunks = (options: CombineChunksOptions) => {
	return internalCombineChunks({
		audioBitrate: options.audioBitrate ?? null,
		numberOfGifLoops: options.numberOfGifLoops ?? null,
		indent: false,
		logLevel: options.logLevel ?? 'info',
		binariesDirectory: options.binariesDirectory ?? null,
		cancelSignal: options.cancelSignal,
		metadata: options.metadata ?? null,
		audioCodec: options.audioCodec ?? null,
		preferLossless: options.preferLossless,
		audioFiles: options.audioFiles,
		codec: options.codec,
		fps: options.fps,
		framesPerChunk: options.framesPerChunk,
		outputLocation: options.outputLocation,
		onProgress: options.onProgress ?? (() => {}),
		videoFiles: options.videoFiles,
		everyNthFrame: options.everyNthFrame ?? 1,
		frameRange: options.frameRange ?? null,
		compositionDurationInFrames: options.compositionDurationInFrames,
	});
};
