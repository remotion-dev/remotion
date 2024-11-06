import type {HardwareAccelerationOption} from './client';
import type {Codec} from './codec';

export const getCodecName = (
	codec: Codec,
	hwAcceleration: HardwareAccelerationOption,
): string | null => {
	if (codec === 'prores') {
		if (hwAcceleration === 'disable') {
			return 'prores_ks';
		}

		const availableHwAcceleration =
			process.platform === 'darwin' ? 'prores_videotoolbox' : null;

		if (hwAcceleration === 'force') {
			if (!availableHwAcceleration) {
				throw new Error(
					`Cannot use hardware acceleration for ProRes on platform ${process.platform}`,
				);
			}

			return availableHwAcceleration;
		}

		return availableHwAcceleration ?? 'prores_ks';
	}

	if (hwAcceleration === 'force') {
		throw new Error(
			`Cannot use hardware acceleration for ${codec} on platform ${process.platform}`,
		);
	}

	if (codec === 'h264') {
		return 'libx264';
	}

	if (codec === 'h265') {
		return 'libx265';
	}

	if (codec === 'vp8') {
		return 'libvpx';
	}

	if (codec === 'vp9') {
		return 'libvpx-vp9';
	}

	if (codec === 'gif') {
		return 'gif';
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
		return 'libx264';
	}

	if (codec === 'h264-ts') {
		return 'libx264';
	}

	throw new Error(`Could not get codec for ${codec satisfies never}`);
};
