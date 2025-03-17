import type {
	AudioCodec,
	CancelSignal,
	CombineChunksOnProgress,
	FrameRange,
	LogLevel,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'node:fs';
import {join} from 'node:path';

import type {CloudProvider, ServerlessCodec} from '@remotion/serverless-client';
import {REMOTION_CONCATENATED_TOKEN} from '@remotion/serverless-client';
import type {InsideFunctionSpecifics} from './provider-implementation';

export const concatVideos = async <Provider extends CloudProvider>({
	onProgress,
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
	metadata,
	insideFunctionSpecifics,
	everyNthFrame,
	frameRange,
	compositionDurationInFrames,
}: {
	onProgress: CombineChunksOnProgress;
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
	metadata: Record<string, string> | null;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
	compositionDurationInFrames: number;
	everyNthFrame: number;
	frameRange: FrameRange | null;
}) => {
	const outfile = join(
		RenderInternals.tmpDir(REMOTION_CONCATENATED_TOKEN),
		`concat.${RenderInternals.getFileExtensionFromCodec(codec, audioCodec)}`,
	);
	const combine = insideFunctionSpecifics.timer('Combine chunks', logLevel);

	const audioFiles = files.filter((f) => f.endsWith('audio'));
	const videoFiles = files.filter((f) => f.endsWith('video'));

	await RenderInternals.internalCombineChunks({
		outputLocation: outfile,
		onProgress,
		codec,
		fps,
		numberOfGifLoops,
		audioBitrate,
		indent: false,
		logLevel,
		binariesDirectory,
		cancelSignal,
		metadata,
		audioFiles,
		videoFiles,
		framesPerChunk: framesPerLambda,
		audioCodec,
		preferLossless,
		compositionDurationInFrames,
		everyNthFrame,
		frameRange,
	});

	combine.end();

	const cleanupChunksProm = fs.promises.rm(outdir, {
		recursive: true,
		force: true,
	});
	return {outfile, cleanupChunksProm};
};
