import fs from 'node:fs';
import path from 'node:path';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';

/**
 * The two stream copies that finish a VA-API H.264 file (vaapi.ts): the
 * stream is extracted to Annex B, which carries only the parameter sets the
 * driver wrote into it (`h264_mp4toannexb` inserts none where the stream has
 * them), and wrapped again at the composition's frame rate, so the container's
 * header is built from those sets and not from FFmpeg's. The encode has no
 * B-frames, so the frame rate gives back every timestamp. The audio, if any, is
 * copied from the original file.
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
	const mp4Family = ['.mp4', '.mov', '.m4v'].includes(
		path.extname(output).toLowerCase(),
	);
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
			...(mp4Family ? ['-video_track_timescale', '90000'] : []),
			output,
		],
	};
};

/**
 * Run right after an `h264_vaapi` encode, on whichever file it wrote: the
 * file is rewrapped once from the stream's own parameter sets, in place.
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
