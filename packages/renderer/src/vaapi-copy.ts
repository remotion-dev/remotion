import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import {getHevcCropBitstreamFilter} from './vaapi';

/**
 * The arguments for copying a pre-encoded HEVC stream into MP4 or MOV: the
 * `hvc1` tag (QuickTime, Safari and most editors read only that one; FFmpeg
 * writes `hev1` by default) and, when the stream is larger than the
 * composition, its missing crop.
 */
export const getHevcCopyArgs = async ({
	file,
	width,
	height,
	binariesDirectory,
	indent,
	logLevel,
	cancelSignal,
}: {
	file: string;
	width: number;
	height: number;
	binariesDirectory: string | null;
	indent: boolean;
	logLevel: LogLevel;
	cancelSignal: CancelSignal | undefined;
}): Promise<string[][]> => {
	const args: string[][] = [['-tag:v', 'hvc1']];
	try {
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
		if (crop) {
			args.push(crop);
		}
	} catch {
		// the stream is copied as it is
	}

	return args;
};
