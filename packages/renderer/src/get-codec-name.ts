import type {OnLog} from './browser/BrowserPage';
import type {Codec} from './codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {HardwareAccelerationOption} from './options/hardware-acceleration';
import type {PixelFormat} from './pixel-format';
import {getVaapiEncoderFor} from './vaapi';

export type CodecSettings = {
	encoderName: string;
	hardwareAccelerated: boolean;
};

export const hasSpecifiedUnsupportedHardwareQualifySettings = ({
	encodingMaxRate,
	encodingBufferSize,
	proResBitsPerMacroblock,
	crf,
}: {
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	proResBitsPerMacroblock: number | null;
	crf: unknown;
}) => {
	if (proResBitsPerMacroblock !== null) {
		return 'proResBitsPerMacroblock';
	}

	if (encodingBufferSize !== null) {
		return 'encodingBufferSize';
	}

	if (encodingMaxRate !== null) {
		return 'encodingMaxRate';
	}

	if (crf !== null && typeof crf !== 'undefined') {
		return 'crf';
	}

	return null;
};

export const getCodecName = ({
	codec,
	encodingMaxRate,
	encodingBufferSize,
	proResBitsPerMacroblock,
	crf,
	hardwareAcceleration,
	logLevel,
	indent,
	onLog,
	pixelFormat = null,
	vaapiRawStream = false,
}: {
	codec: Codec;
	hardwareAcceleration: HardwareAccelerationOption;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	proResBitsPerMacroblock: number | null;
	crf: unknown;
	logLevel: LogLevel;
	indent: boolean;
	onLog: OnLog | null;
	pixelFormat?: PixelFormat | null;
	// the encode writes the video alone as a raw stream, finished after it
	// (vaapi-output.ts): only then can H.265 be encoded with VA-API (vaapi.ts)
	vaapiRawStream?: boolean;
}): CodecSettings | null => {
	const preferredHwAcceleration =
		hardwareAcceleration === 'required' ||
		hardwareAcceleration === 'if-possible';

	// VA-API (AMD and Intel on Linux, REMOTION_VAAPI_DEVICE) takes the CRF as
	// its constant quantizer, so a CRF does not turn it off; it is only chosen
	// for what it can encode exactly (vaapi.ts: 8-bit 4:2:0, a CRF of 1 or more,
	// H.265 only into a raw stream)
	const vaapiEncoderName = preferredHwAcceleration
		? getVaapiEncoderFor({codec, pixelFormat, crf, rawStream: vaapiRawStream})
		: null;

	const unsupportedQualityOption =
		hasSpecifiedUnsupportedHardwareQualifySettings({
			encodingMaxRate,
			encodingBufferSize,
			proResBitsPerMacroblock,
			crf: vaapiEncoderName ? null : crf,
		});

	if (hardwareAcceleration === 'required' && unsupportedQualityOption) {
		throw new Error(
			`When using hardware accelerated encoding, the option "${unsupportedQualityOption}" with hardware acceleration is not supported. Disable hardware accelerated encoding or use "if-possible" instead.`,
		);
	}

	const warnAboutDisabledHardwareAcceleration = () => {
		if (hardwareAcceleration === 'if-possible' && unsupportedQualityOption) {
			const message = `Hardware accelerated encoding disabled - "${unsupportedQualityOption}" option is not supported with hardware acceleration`;
			if (onLog !== null) {
				onLog({
					logLevel: 'warn',
					previewString: message,
					tag: '',
				});
				return;
			}

			Log.warn({indent, logLevel}, `${indent ? '' : '\n'}${message}`);
		}
	};

	if (codec === 'prores') {
		if (
			preferredHwAcceleration &&
			process.platform === 'darwin' &&
			!unsupportedQualityOption
		) {
			return {encoderName: 'prores_videotoolbox', hardwareAccelerated: true};
		}

		if (
			preferredHwAcceleration &&
			process.platform !== 'darwin' &&
			!unsupportedQualityOption
		) {
			if (hardwareAcceleration === 'required') {
				throw new Error(
					`Codec "prores" does not support hardware acceleration on ${process.platform}, but "hardwareAcceleration" is set to "required"`,
				);
			}
		}

		warnAboutDisabledHardwareAcceleration();

		return {encoderName: 'prores_ks', hardwareAccelerated: false};
	}

	if (codec === 'h264') {
		if (
			preferredHwAcceleration &&
			process.platform === 'darwin' &&
			!unsupportedQualityOption
		) {
			return {encoderName: 'h264_videotoolbox', hardwareAccelerated: true};
		}

		// VA-API for Linux, when a render device is given
		if (vaapiEncoderName && !unsupportedQualityOption) {
			return {encoderName: vaapiEncoderName, hardwareAccelerated: true};
		}

		// NVENC for Linux/Windows
		if (
			preferredHwAcceleration &&
			(process.platform === 'linux' || process.platform === 'win32') &&
			!unsupportedQualityOption
		) {
			return {encoderName: 'h264_nvenc', hardwareAccelerated: true};
		}

		warnAboutDisabledHardwareAcceleration();

		return {encoderName: 'libx264', hardwareAccelerated: false};
	}

	if (codec === 'h265') {
		if (
			preferredHwAcceleration &&
			process.platform === 'darwin' &&
			!unsupportedQualityOption
		) {
			return {encoderName: 'hevc_videotoolbox', hardwareAccelerated: true};
		}

		// VA-API for Linux, when a render device is given
		if (vaapiEncoderName && !unsupportedQualityOption) {
			return {encoderName: vaapiEncoderName, hardwareAccelerated: true};
		}

		// NVENC for Linux/Windows
		if (
			preferredHwAcceleration &&
			(process.platform === 'linux' || process.platform === 'win32') &&
			!unsupportedQualityOption
		) {
			return {encoderName: 'hevc_nvenc', hardwareAccelerated: true};
		}

		warnAboutDisabledHardwareAcceleration();

		return {encoderName: 'libx265', hardwareAccelerated: false};
	}

	if (codec === 'vp8') {
		return {encoderName: 'libvpx', hardwareAccelerated: false};
	}

	if (codec === 'vp9') {
		return {encoderName: 'libvpx-vp9', hardwareAccelerated: false};
	}

	if (codec === 'av1') {
		Log.warn(
			{indent, logLevel},
			'AV1 encoding is significantly slower than other codecs.',
		);
		return {encoderName: 'libaom-av1', hardwareAccelerated: false};
	}

	if (codec === 'gif') {
		return {encoderName: 'gif', hardwareAccelerated: false};
	}

	if (codec === 'mp3') {
		return null;
	}

	if (codec === 'aac') {
		return null;
	}

	if (codec === 'wav') {
		return null;
	}

	if (codec === 'h264-mkv') {
		if (hardwareAcceleration === 'required') {
			throw new Error(
				`Codec "h264-mkv" does not support hardware acceleration on ${process.platform}, but "hardwareAcceleration" is set to "required"`,
			);
		}

		return {encoderName: 'libx264', hardwareAccelerated: false};
	}

	if (codec === 'h264-ts') {
		if (hardwareAcceleration === 'required') {
			throw new Error(
				`Codec "h264-ts" does not support hardware acceleration on ${process.platform}, but "hardwareAcceleration" is set to "required"`,
			);
		}

		return {encoderName: 'libx264', hardwareAccelerated: false};
	}

	throw new Error(`Could not get codec for ${codec satisfies never}`);
};
