import type {AudioCodec, CancelSignal, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {ServerlessCodec} from '@remotion/serverless/client';
import fs from 'node:fs';
import {join} from 'node:path';
import {
	REMOTION_CONCATED_TOKEN,
	REMOTION_FILELIST_TOKEN,
} from '../../shared/constants';
import {
	canConcatAudioSeamlessly,
	canConcatVideoSeamlessly,
} from './can-concat-seamlessly';
import {timer} from './timer';

export const concatVideos = async ({
	onProgress,
	numberOfFrames,
	codec,
	fps,
	numberOfGifLoops,
	files,
	outdir,
	audioCodec,
	audioBitrate,
	logLevel,
	framesPerLambda,
	binariesDirectory,
	cancelSignal,
	preferLossless,
	muted,
}: {
	onProgress: (frames: number) => void;
	numberOfFrames: number;
	codec: ServerlessCodec;
	fps: number;
	numberOfGifLoops: number | null;
	files: string[];
	outdir: string;
	audioCodec: AudioCodec | null;
	audioBitrate: string | null;
	logLevel: LogLevel;
	framesPerLambda: number;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	preferLossless: boolean;
	muted: boolean;
}) => {
	const outfile = join(
		RenderInternals.tmpDir(REMOTION_CONCATED_TOKEN),
		`concat.${RenderInternals.getFileExtensionFromCodec(codec, audioCodec)}`,
	);
	const combine = timer('Combine chunks', logLevel);
	const filelistDir = RenderInternals.tmpDir(REMOTION_FILELIST_TOKEN);

	const chunkDurationInSeconds = framesPerLambda / fps;

	const resolvedAudioCodec = RenderInternals.resolveAudioCodec({
		setting: audioCodec,
		codec,
		preferLossless,
		separateAudioTo: null,
	});

	const seamlessAudio = canConcatAudioSeamlessly(
		resolvedAudioCodec,
		framesPerLambda,
	);
	const seamlessVideo = canConcatVideoSeamlessly(codec);

	await RenderInternals.combineChunks({
		files,
		filelistDir,
		output: outfile,
		onProgress,
		numberOfFrames,
		codec,
		fps,
		numberOfGifLoops,
		resolvedAudioCodec,
		audioBitrate,
		indent: false,
		logLevel,
		chunkDurationInSeconds,
		binariesDirectory,
		cancelSignal,
		seamlessAudio,
		seamlessVideo,
		muted,
	});
	combine.end();

	const cleanupChunksProm = fs.promises.rm(outdir, {
		recursive: true,
		force: true,
	});
	return {outfile, cleanupChunksProm};
};
