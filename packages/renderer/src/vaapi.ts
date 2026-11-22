import type {Codec} from './codec';
import type {PixelFormat} from './pixel-format';

/**
 * VA-API hardware encoding on Linux (AMD and Intel GPUs), next to NVENC.
 *
 * Enabled by pointing `REMOTION_VAAPI_DEVICE` at a render node
 * (for example `/dev/dri/renderD128`) and setting `hardwareAcceleration` to
 * `"if-possible"` or `"required"`. The FFmpeg in use must be built with VA-API
 * (`h264_vaapi` and the `hwupload` filter); the encoder probe falls back to
 * software encoding when it is not, or when the device cannot start an encode
 * (probe-encoder.ts).
 *
 * H.264 only. Mesa's radeonsi (measured on an RX 6800 XT and an RX 7900 XTX,
 * Mesa 25.0) writes its own parameter sets into the stream and they differ
 * from FFmpeg's, which the container carries: for H.264 in the PPS
 * (`transform_8x8_mode_flag`, `pic_init_qp_minus26`), for HEVC in the coded
 * size (the width rounded to 64, the height to 16, without a conformance
 * window) and in coding tools, so a decoder that sets itself up from the
 * container shows garbage or refuses the file (Apple's AVFoundation does). An
 * H.264 file is therefore rewrapped once after the encode, from the stream's
 * own parameter sets (vaapi-output.ts), and encoded without B-frames so that
 * the rewrap keeps every timestamp. HEVC cannot be repaired that way for
 * Apple's decoders, which ignore an HEVC conformance window (a 1080p file shows
 * the padding rows), so `h265` keeps its encoder (NVENC or software).
 *
 * No Node.js module is imported here: crf.ts, which is part of the browser
 * build (pure.ts), uses this file.
 */
export const VAAPI_DEVICE_ENV = 'REMOTION_VAAPI_DEVICE';

export const getVaapiDevice = (): string | null => {
	if (typeof process === 'undefined' || process.platform !== 'linux') {
		return null;
	}

	const device = process.env?.[VAAPI_DEVICE_ENV];
	return device ? device : null;
};

export const getVaapiEncoderName = (codec: Codec): string | null => {
	if (codec === 'h264') {
		return 'h264_vaapi';
	}

	return null;
};

/**
 * The VA-API encoder for a render, or null when VA-API cannot produce exactly
 * what was asked for:
 * - only 8-bit 4:2:0 (`yuv420p`): the frames are uploaded as NV12, so a 10-bit
 *   or 4:4:4 request would silently be encoded as 8-bit 4:2:0
 * - a CRF of 1 or more: FFmpeg treats `-qp 0` as unset and uses its default
 *   quantizer (25 for HEVC), so CRF 0 stays on the software encoder
 * `pixelFormat: null` skips the pixel format check (when it is not known yet).
 */
export const getVaapiEncoderFor = ({
	codec,
	pixelFormat,
	crf,
}: {
	codec: Codec;
	pixelFormat: PixelFormat | null;
	crf: unknown;
}): string | null => {
	if (getVaapiDevice() === null) {
		return null;
	}

	if (pixelFormat !== null && pixelFormat !== 'yuv420p') {
		return null;
	}

	if (crf !== null && typeof crf !== 'undefined' && crf === 0) {
		return null;
	}

	return getVaapiEncoderName(codec);
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
