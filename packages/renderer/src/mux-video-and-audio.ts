import {getAacPrimingInputArgs} from './aac-priming';
import {callFf} from './call-ffmpeg';
import {convertNumberOfGifLoopsToFfmpegSyntax} from './convert-number-of-gif-loops-to-ffmpeg';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {getFastStartMuxer} from './get-fast-start-muxer';
import {getMp4BrandForExtension} from './get-mp4-brand';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {makeMetadataArgs} from './make-metadata-args';
import type {AudioCodec} from './options/audio-codec';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {truthy} from './truthy';

export const muxVideoAndAudio = async ({
	videoOutput,
	audioOutput,
	output,
	indent,
	logLevel,
	onProgress,
	binariesDirectory,
	fps,
	cancelSignal,
	metadata,
	numberOfGifLoops,
	audioCodec,
	sampleRate,
}: {
	videoOutput: string | null;
	audioOutput: string | null;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	fps: number;
	onProgress: (p: number) => void;
	cancelSignal: CancelSignal | undefined;
	metadata?: Record<string, string> | null;
	numberOfGifLoops: number | null;
	audioCodec: AudioCodec | null;
	sampleRate: number;
}) => {
	const startTime = Date.now();
	Log.verbose({indent, logLevel}, 'Muxing video and audio together');
	const outputExtension = getExtensionOfFilename(output);
	const fastStartMuxer = outputExtension
		? getFastStartMuxer(outputExtension)
		: null;
	const mp4Brand = getMp4BrandForExtension(outputExtension);

	const command = [
		'-hide_banner',
		videoOutput ? '-i' : null,
		videoOutput,
		...(audioOutput
			? getAacPrimingInputArgs({
					audioCodec,
					sampleRate,
					outputExtension,
				})
			: []),
		audioOutput ? '-i' : null,
		audioOutput,
		videoOutput ? '-c:v' : null,
		videoOutput ? 'copy' : null,
		audioOutput ? '-c:a' : null,
		audioOutput ? 'copy' : null,
		// Set the exact output framerate to prevent drift when combining chunks.
		// Without this, ffmpeg infers the framerate from the stream which can
		// result in slightly imprecise values like 95940000/3197999 instead of 30/1.
		videoOutput ? '-r' : null,
		videoOutput ? String(fps) : null,
		// Keep the MP4/MOV video time base consistent with the initial encoding.
		videoOutput ? '-video_track_timescale' : null,
		videoOutput ? '90000' : null,
		numberOfGifLoops === null ? null : '-loop',
		numberOfGifLoops === null
			? null
			: convertNumberOfGifLoopsToFfmpegSyntax(numberOfGifLoops),
		mp4Brand ? '-f' : null,
		mp4Brand ? 'mp4' : null,
		mp4Brand ? '-brand' : null,
		mp4Brand,
		fastStartMuxer || mp4Brand ? '-movflags' : null,
		fastStartMuxer || mp4Brand ? 'faststart' : null,
		...makeMetadataArgs(metadata ?? {}),
		'-y',
		output,
	].filter(truthy);

	Log.verbose({indent, logLevel}, 'Combining command: ', command);

	const task = callFf({
		bin: 'ffmpeg',
		args: command,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
	task.stderr?.on('data', (data: Buffer) => {
		const utf8 = data.toString('utf8');
		const parsed = parseFfmpegProgress(utf8, fps);
		if (parsed === undefined) {
			if (
				!utf8.includes(
					'Estimating duration from bitrate, this may be inaccurate',
				)
			) {
				Log.verbose({indent, logLevel}, utf8);
			}
		} else {
			Log.verbose({indent, logLevel}, `Combined ${parsed} frames`);
			onProgress(parsed);
		}
	});

	await task;
	Log.verbose({indent, logLevel}, `Muxing done in ${Date.now() - startTime}ms`);
};
