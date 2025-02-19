import type {Codec} from './codec';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {HardwareAccelerationOption} from './options/hardware-acceleration';

export type CodecSettings = {
	encoderName: string;
	hardwareAccelerated: boolean;
};

export const hasSpecifiedUnsupportedHardwareQualifySettings = ({
	encodingMaxRate,
	encodingBufferSize,
	crf,
}: {
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	crf: unknown;
}) => {
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
	crf,
	hardwareAcceleration,
	logLevel,
	indent,
}: {
	codec: Codec;
	hardwareAcceleration: HardwareAccelerationOption;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	crf: unknown;
	logLevel: LogLevel;
	indent: boolean;
}): CodecSettings | null => {
	const preferredHwAcceleration =
		hardwareAcceleration === 'required' ||
		hardwareAcceleration === 'if-possible';

	const unsupportedQualityOption =
		hasSpecifiedUnsupportedHardwareQualifySettings({
			encodingMaxRate,
			encodingBufferSize,
			crf,
		});

	if (hardwareAcceleration === 'required' && unsupportedQualityOption) {
		throw new Error(
			`When using hardware accelerated encoding, the option "${unsupportedQualityOption}" with hardware acceleration is not supported. Disable hardware accelerated encoding or use "if-possible" instead.`,
		);
	}

	const warnAboutDisabledHardwareAcceleration = () => {
		if (hardwareAcceleration === 'if-possible' && unsupportedQualityOption) {
			Log.warn(
				{indent, logLevel},
				`${indent ? '' : '\n'}Hardware accelerated encoding disabled - "${unsupportedQualityOption}" option is not supported with hardware acceleration`,
			);
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

		warnAboutDisabledHardwareAcceleration();

		return {encoderName: 'libx265', hardwareAccelerated: false};
	}

	if (codec === 'vp8') {
		return {encoderName: 'libvpx', hardwareAccelerated: false};
	}

	if (codec === 'vp9') {
		return {encoderName: 'libvpx-vp9', hardwareAccelerated: false};
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
		return {encoderName: 'libx264', hardwareAccelerated: false};
	}

	if (codec === 'h264-ts') {
		return {encoderName: 'libx264', hardwareAccelerated: false};
	}

	throw new Error(`Could not get codec for ${codec satisfies never}`);
};
