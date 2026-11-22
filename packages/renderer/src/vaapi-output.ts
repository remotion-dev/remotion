import fs from 'node:fs';
import path from 'node:path';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';

const isMp4Family = (file: string) =>
	['.mp4', '.mov', '.m4v'].includes(path.extname(file).toLowerCase());

/**
 * A VA-API pre-encode written as a raw stream (vaapi.ts): the stream, its
 * format and the size the composition asked for.
 */
export type VaapiRawStream = {
	file: string;
	format: 'h264' | 'hevc';
	width: number;
	height: number;
};

// The raw stream is written next to the file it becomes
export const getVaapiRawStreamLocation = (
	output: string,
	format: 'h264' | 'hevc',
): string => {
	const extension = path.extname(output);
	return path.join(
		path.dirname(output),
		`${path.basename(output, extension)}.vaapi.${format}`,
	);
};

// Reads the SPS of the stream's first access unit (FFmpeg's trace_headers)
export const getHevcCodedSizeArgs = (file: string): string[] => [
	'-hide_banner',
	'-v',
	'info',
	'-f',
	'hevc',
	'-i',
	file,
	'-c',
	'copy',
	'-bsf:v',
	'trace_headers',
	'-frames:v',
	'1',
	'-f',
	'null',
	'-',
];

/**
 * The coded size the driver wrote into the HEVC SPS
 * (`pic_width_in_luma_samples`, `pic_height_in_luma_samples`), from the
 * output of getHevcCodedSizeArgs().
 */
export const parseHevcCodedSize = (
	trace: string,
): {width: number; height: number} | null => {
	const width = /pic_width_in_luma_samples\b[^\n]*=\s*(\d+)/.exec(trace);
	const height = /pic_height_in_luma_samples\b[^\n]*=\s*(\d+)/.exec(trace);
	if (!width || !height) {
		return null;
	}

	return {width: Number(width[1]), height: Number(height[1])};
};

/**
 * Writes the crop from the coded size back to the size asked into the
 * stream's own SPS, as its conformance window. All four offsets are set: the
 * window the driver wrote is not trusted (vaapi.ts).
 */
export const getHevcCropArgs = ({
	input,
	output,
	codedWidth,
	codedHeight,
	width,
	height,
}: {
	input: string;
	output: string;
	codedWidth: number;
	codedHeight: number;
	width: number;
	height: number;
}): string[] => {
	if (codedWidth < width || codedHeight < height) {
		throw new Error(
			`The VA-API HEVC stream is coded at ${codedWidth}x${codedHeight}, smaller than the ${width}x${height} asked for.`,
		);
	}

	return [
		'-hide_banner',
		'-v',
		'error',
		'-y',
		'-f',
		'hevc',
		'-i',
		input,
		'-c',
		'copy',
		'-bsf:v',
		`hevc_metadata=crop_left=0:crop_right=${codedWidth - width}:crop_top=0:crop_bottom=${codedHeight - height}`,
		'-f',
		'hevc',
		output,
	];
};

/**
 * Wraps a raw stream into its container at the composition's frame rate (the
 * encode has no B-frames, so this gives back every timestamp). The container's
 * header is built from the stream's own parameter sets, and for MP4 and MOV
 * the sample entry takes the cropped size. HEVC is tagged hvc1, the tag
 * QuickTime and Safari read.
 */
export const getVaapiWrapArgs = ({
	input,
	format,
	output,
	fps,
}: {
	input: string;
	format: 'h264' | 'hevc';
	output: string;
	fps: number;
}): string[] => {
	const mp4Family = isMp4Family(output);
	return [
		'-hide_banner',
		'-v',
		'error',
		'-y',
		'-r',
		String(fps),
		'-f',
		format,
		'-i',
		input,
		'-c',
		'copy',
		...(format === 'hevc' && mp4Family ? ['-tag:v', 'hvc1'] : []),
		...(mp4Family ? ['-video_track_timescale', '90000'] : []),
		output,
	];
};

/**
 * Run right after a VA-API pre-encode: its raw stream becomes `output`. An
 * HEVC stream first gets its crop (the coded size read from its SPS); an
 * H.264 stream carries the right crop already (measured on Mesa 25.0 at
 * 1920x1080 and 800x450).
 */
export const finishVaapiRawStream = async ({
	stream,
	output,
	fps,
	binariesDirectory,
	indent,
	logLevel,
	cancelSignal,
}: {
	stream: VaapiRawStream;
	output: string;
	fps: number;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
	cancelSignal: CancelSignal | undefined;
}): Promise<void> => {
	const run = (args: string[]) =>
		callFf({
			bin: 'ffmpeg',
			args,
			indent,
			logLevel,
			binariesDirectory,
			cancelSignal,
		});
	const cropped = `${stream.file}.crop`;
	try {
		let source = stream.file;
		if (stream.format === 'hevc') {
			const {stderr} = await run(getHevcCodedSizeArgs(stream.file));
			const coded = parseHevcCodedSize(stderr);
			if (coded === null) {
				throw new Error(
					`Could not read the coded size of the VA-API HEVC stream ${stream.file}`,
				);
			}

			await run(
				getHevcCropArgs({
					input: stream.file,
					output: cropped,
					codedWidth: coded.width,
					codedHeight: coded.height,
					width: stream.width,
					height: stream.height,
				}),
			);
			source = cropped;
		}

		await run(
			getVaapiWrapArgs({
				input: source,
				format: stream.format,
				output,
				fps,
			}),
		);
	} finally {
		fs.rmSync(stream.file, {force: true});
		fs.rmSync(cropped, {force: true});
	}
};

/**
 * The two stream copies that finish an `h264_vaapi` file the stitcher encoded
 * together with its audio (no raw stream there): the stream is extracted to
 * Annex B, which carries only the parameter sets the driver wrote into it
 * (`h264_mp4toannexb` inserts none where the stream has them), and wrapped
 * again at the composition's frame rate, so the container's header is built
 * from those sets and not from FFmpeg's. The audio is copied from the original
 * file.
 */
export const getVaapiRewrapArgs = ({
	input,
	annexB,
	output,
	fps,
}: {
	input: string;
	annexB: string;
	output: string;
	fps: number;
}): {extract: string[]; wrap: string[]} => {
	return {
		extract: [
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-i',
			input,
			'-map',
			'0:v',
			'-c',
			'copy',
			'-bsf:v',
			'h264_mp4toannexb',
			'-f',
			'h264',
			annexB,
		],
		wrap: [
			'-hide_banner',
			'-v',
			'error',
			'-y',
			'-r',
			String(fps),
			'-f',
			'h264',
			'-i',
			annexB,
			'-i',
			input,
			'-map',
			'0:v',
			'-map',
			'1:a?',
			'-c',
			'copy',
			...(isMp4Family(output) ? ['-video_track_timescale', '90000'] : []),
			output,
		],
	};
};

/**
 * Run right after the stitcher's own `h264_vaapi` encode, on the file it
 * wrote: the file is rewrapped once from the stream's own parameter sets, in
 * place.
 */
export const finishVaapiOutput = async ({
	file,
	fps,
	binariesDirectory,
	indent,
	logLevel,
	cancelSignal,
}: {
	file: string;
	fps: number;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
	cancelSignal: CancelSignal | undefined;
}): Promise<void> => {
	const extension = path.extname(file);
	const base = path.join(path.dirname(file), path.basename(file, extension));
	const annexB = `${base}.vaapi.h264`;
	const temporary = `${base}.vaapi${extension}`;
	const {extract, wrap} = getVaapiRewrapArgs({
		input: file,
		annexB,
		output: temporary,
		fps,
	});
	try {
		for (const args of [extract, wrap]) {
			await callFf({
				bin: 'ffmpeg',
				args,
				indent,
				logLevel,
				binariesDirectory,
				cancelSignal,
			});
		}

		fs.renameSync(temporary, file);
	} finally {
		fs.rmSync(annexB, {force: true});
		fs.rmSync(temporary, {force: true});
	}
};
