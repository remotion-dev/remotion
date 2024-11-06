import type {Codec} from './codec';

export type CodecSettings = {
	encoderName: string;
	hardwareAccelerated: boolean;
};

export const getCodecName = (
	codec: Codec,
	preferredHwAcceleration: boolean,
): CodecSettings | null => {
	if (codec === 'prores') {
		if (preferredHwAcceleration && process.platform === 'darwin') {
			return {encoderName: 'prores_videotoolbox', hardwareAccelerated: true};
		}

		return {encoderName: 'prores_ks', hardwareAccelerated: false};
	}

	if (codec === 'h264') {
		return {encoderName: 'libx264', hardwareAccelerated: false};
	}

	if (codec === 'h265') {
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
