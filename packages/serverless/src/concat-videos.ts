import type {AudioCodec, CancelSignal, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import {join} from 'node:path';

import {
	canConcatAudioSeamlessly,
	canConcatVideoSeamlessly,
} from './can-concat-seamlessly';

import type {CloudProvider, ServerlessCodec} from '@remotion/serverless-client';
import {
	REMOTION_CONCATENATED_TOKEN,
	REMOTION_FILELIST_TOKEN,
} from '@remotion/serverless-client';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const concatVideos = async <Provider extends CloudProvider>({
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
	metadata,
	insideFunctionSpecifics,
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
	metadata: Record<string, string> | null;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}) => {
	const outfile = join(
		RenderInternals.tmpDir(REMOTION_CONCATENATED_TOKEN),
		`concat.${RenderInternals.getFileExtensionFromCodec(codec, audioCodec)}`,
	);
	const combine = insideFunctionSpecifics.timer('Combine chunks', logLevel);
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
		metadata,
	});
	combine.end();

	const cleanupChunksProm = fs.promises.rm(outdir, {
		recursive: true,
		force: true,
	});
	return {outfile, cleanupChunksProm};
};
