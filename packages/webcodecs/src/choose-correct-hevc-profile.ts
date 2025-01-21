import {hevcLevels} from './hevc-levels';

export const chooseCorrectHevcProfile = ({
	width,
	height,
	fps,
}: {
	width: number;
	height: number;
	fps: number | null;
}) => {
	const profile = hevcLevels.find((p) => {
		return p.maxResolutionsAndFrameRates.some((max) => {
			if (width > max.width) {
				return false;
			}

			if (height > max.height) {
				return false;
			}

			// if has no fps, use 60 as a conservative fallback
			const fallbackFps = fps ?? 60;
			return fallbackFps <= max.fps;
		});
	});

	if (!profile) {
		throw new Error(
			`No suitable HEVC profile found for ${width}x${height}@${fps}fps`,
		);
	}

	// HEVC codec string format: hev1.2.${level_hex} or hvc1.2.${level_hex}
	// We'll use hvc1 as it's more widely supported
	return `hvc1.${
		// Profile
		// 1 = Main
		// 2 = Main 10
		// Chrome seems to support only Main
		1
	}.${
		// Profile space
		// Unclear which value to set, but 0 works
		0
	}.${
		// L = Main tier
		// H = High tier
		// TODO: Select high tier if resolution is big
		'L'
	}${
		// Level
		Math.round(Number(profile.level) * 30)
	}.${
		// Bit depth
		'b0'
	}`;
};
