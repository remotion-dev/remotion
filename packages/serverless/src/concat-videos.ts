import fs from 'node:fs';
import {join} from 'node:path';
import type {
	AudioCodec,
	CancelSignal,
	CombineChunksOnProgress,
	SingleFrameRange,
	LogLevel,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
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
	sampleRate,
	outputExtension,
	separateAudioFilename,
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
	frameRange: SingleFrameRange | null;
	sampleRate: number;
	outputExtension: string | null;
	separateAudioFilename: string | null;
}) => {
	// .m4a, .m4b and .3gp need to be muxed into their container, otherwise the
	// ADTS stream would be uploaded as-is under that name.
	const extension = RenderInternals.getMp4BrandForExtension(outputExtension)
		? (outputExtension as string)
		: RenderInternals.getFileExtensionFromCodec(
				codec,
				separateAudioFilename === null ? audioCodec : null,
			);
	const outputDirectory = RenderInternals.tmpDir(REMOTION_CONCATENATED_TOKEN);
	const separateAudioFile =
		separateAudioFilename === null
			? null
			: join(
					outputDirectory,
					`audio.${RenderInternals.getExtensionOfFilename(separateAudioFilename)?.toLowerCase()}`,
				);
	const outfile = join(outputDirectory, `concat.${extension}`);
	const combine = insideFunctionSpecifics.timer('Combine chunks', logLevel);

	const audioFiles = files.filter((f) => f.endsWith('audio'));
	const videoFiles = files.filter((f) => f.endsWith('video'));

	try {
		await RenderInternals.internalCombineChunks({
			separateAudioTo: separateAudioFile,
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
			sampleRate,
		});
	} catch (err) {
		await fs.promises.rm(outputDirectory, {recursive: true, force: true});
		await fs.promises.rm(outdir, {recursive: true, force: true});
		throw err;
	}

	combine.end();

	const cleanupChunksProm = fs.promises.rm(outdir, {
		recursive: true,
		force: true,
	});
	return {outfile, separateAudioFile, cleanupChunksProm};
};
