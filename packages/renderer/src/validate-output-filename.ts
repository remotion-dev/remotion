import type {Codec} from 'remotion';

export const validateOutputFilename = (
	codec: Codec,
	extension: string | null
) => {
	if (codec === 'h264') {
		if (extension !== 'mp4' && extension !== 'mkv') {
			throw new TypeError(
				'When using the H264 codec, the output filename must end in .mp4 or .mkv.'
			);
		}
	}

	if (codec === 'h264-mkv') {
		if (extension !== 'mkv') {
			throw new TypeError(
				'When using the "h264-mkv" codec, the output filename must end in ".mkv".'
			);
		}
	}

	if (codec === 'h265') {
		if (extension !== 'mp4' && extension !== 'hevc') {
			throw new TypeError(
				'When using H265 codec, the output filename must end in .mp4 or .hevc.'
			);
		}
	}

	if (codec === 'vp8' || codec === 'vp9') {
		if (extension !== 'webm') {
			throw new TypeError(
				`When using the ${codec.toUpperCase()} codec, the output filename must end in .webm.`
			);
		}
	}

	if (codec === 'prores') {
		const allowedProResExtensions = ['mov', 'mkv', 'mxf'];
		if (!extension || !allowedProResExtensions.includes(extension)) {
			throw new TypeError(
				`When using the 'prores' codec, the output must end in one of those extensions: ${allowedProResExtensions
					.map((a) => `.${a}`)
					.join(', ')}`
			);
		}
	}

	if (codec === 'mp3') {
		if (extension !== 'mp3') {
			throw new TypeError(
				"When using the 'mp3' codec, the output must end in .mp3"
			);
		}
	}

	if (codec === 'aac') {
		const allowedAacExtensions = ['aac', '3gp', 'm4a', 'm4b', 'mpg', 'mpeg'];
		if (!extension || !allowedAacExtensions.includes(extension)) {
			throw new TypeError(
				`When using the 'aac' codec, the output must end in one of those extensions: ${allowedAacExtensions
					.map((a) => `.${a}`)
					.join(', ')}`
			);
		}
	}

	if (codec === 'wav') {
		if (extension !== 'wav') {
			throw new TypeError(
				"When using the 'wav' codec, the output location must end in .wav."
			);
		}
	}

	if (codec === 'gif') {
		if (extension !== 'gif') {
			throw new TypeError(
				'When using the GIF codec, the output filename must end in .gif.'
			);
		}
	}
};
