import fs from 'node:fs';
import path from 'node:path';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import {getHevcCropBitstreamFilter} from './vaapi';

/**
 * The stream copy that finishes a VA-API HEVC file: the missing crop (when the
 * driver coded it larger than the composition) and the `hvc1` tag for MP4/MOV.
 * Tagging the VA-API encode itself broke the stream with Mesa's radeonsi; a
 * copy afterwards does not.
 */
export const getVaapiHevcRemuxArgs = ({
	input,
	output,
	crop,
	tagHvc1,
}: {
	input: string;
	output: string;
	crop: string[] | null;
	tagHvc1: boolean;
}): string[] => {
	return [
		'-hide_banner',
		'-v',
		'error',
		'-y',
		'-i',
		input,
		'-map',
		'0',
		'-c',
		'copy',
		...(crop ?? []),
		...(tagHvc1 ? ['-tag:v', 'hvc1'] : []),
		output,
	];
};

/**
 * Run right after a `hevc_vaapi` encode, on whichever file it wrote: reads its
 * coded size and, when it is larger than the composition or the file is
 * MP4/MOV, copies it once with the crop and the tag, in place.
 */
export const finishVaapiHevcOutput = async ({
	file,
	width,
	height,
	tagHvc1,
	binariesDirectory,
	indent,
	logLevel,
	cancelSignal,
}: {
	file: string;
	width: number;
	height: number;
	tagHvc1: boolean;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
	cancelSignal: CancelSignal | undefined;
}): Promise<void> => {
	const {stdout} = await callFf({
		bin: 'ffprobe',
		args: [
			'-v',
			'error',
			'-select_streams',
			'v:0',
			'-show_entries',
			'stream=width,height',
			'-of',
			'csv=p=0',
			file,
		],
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
	const [codedWidth, codedHeight] = stdout.trim().split(',').map(Number);
	const crop = getHevcCropBitstreamFilter({
		codedWidth,
		codedHeight,
		width,
		height,
	});
	if (!crop && !tagHvc1) {
		return;
	}

	const extension = path.extname(file);
	const temporary = path.join(
		path.dirname(file),
		`${path.basename(file, extension)}.vaapi${extension}`,
	);
	await callFf({
		bin: 'ffmpeg',
		args: getVaapiHevcRemuxArgs({
			input: file,
			output: temporary,
			crop,
			tagHvc1,
		}),
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
	fs.renameSync(temporary, file);
};
