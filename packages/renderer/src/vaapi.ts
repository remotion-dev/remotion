import fs from 'node:fs';
import {callFf} from './call-ffmpeg';
import type {Codec} from './codec';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';

/**
 * VA-API hardware encoding on Linux (AMD and Intel GPUs), next to NVENC.
 *
 * Enabled by pointing `REMOTION_VAAPI_DEVICE` at a render node
 * (for example `/dev/dri/renderD128`) and setting `hardwareAcceleration` to
 * `"if-possible"` or `"required"`. The FFmpeg in use must be built with VA-API
 * (`h264_vaapi`, `hevc_vaapi` and the `hwupload` filter); the encoder probe
 * falls back to software encoding when it is not.
 */
export const VAAPI_DEVICE_ENV = 'REMOTION_VAAPI_DEVICE';

export const getVaapiDevice = (): string | null => {
	if (process.platform !== 'linux') {
		return null;
	}

	const device = process.env[VAAPI_DEVICE_ENV];
	if (!device) {
		return null;
	}

	return fs.existsSync(device) ? device : null;
};

export const getVaapiEncoderName = (codec: Codec): string | null => {
	if (codec === 'h264') {
		return 'h264_vaapi';
	}

	if (codec === 'h265') {
		return 'hevc_vaapi';
	}

	return null;
};

export const isVaapiEncoder = (encoderName: string): boolean => {
	return encoderName.endsWith('_vaapi');
};

// The frames are uploaded to the GPU as NV12 after every other filter ran.
export const VAAPI_UPLOAD_FILTER = 'format=nv12,hwupload';

/**
 * Adds the VA-API upload as the last step of the video filters:
 * an existing `-vf` (for example the color space conversion) is extended,
 * otherwise a new one is added.
 */
export const withVaapiUpload = (args: string[][]): string[][] => {
	let found = false;
	const mapped = args.map((arg) => {
		if (arg[0] === '-vf' && arg.length === 2) {
			found = true;
			return ['-vf', `${arg[1]},${VAAPI_UPLOAD_FILTER}`];
		}

		return arg;
	});

	return found ? mapped : [...mapped, ['-vf', VAAPI_UPLOAD_FILTER]];
};

/**
 * Some VA-API drivers (Mesa's radeonsi, measured on an RX 6800 XT and an
 * RX 7900 XTX) code an HEVC stream at the 16-aligned size without writing the
 * conformance window: a 1920x1080 render comes out 1920x1088. When the
 * pre-encoded stream is larger than the composition, the copy step writes the
 * missing crop into the bitstream. A stream of the right size is left alone.
 */
export const getHevcCropBitstreamFilter = ({
	codedWidth,
	codedHeight,
	width,
	height,
}: {
	codedWidth: number;
	codedHeight: number;
	width: number;
	height: number;
}): string[] | null => {
	const right = codedWidth - width;
	const bottom = codedHeight - height;
	if (right < 0 || bottom < 0 || (right === 0 && bottom === 0)) {
		return null;
	}

	return ['-bsf:v', `hevc_metadata=crop_right=${right}:crop_bottom=${bottom}`];
};

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
