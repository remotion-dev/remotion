import {Codec} from 'remotion';
import {Log} from './log';
import {
	getUserPassedFileExtension,
	getUserPassedOutputLocation,
} from './user-passed-output-location';

// eslint-disable-next-line complexity
export const getOutputFilename = (
	codec: Codec,
	imageSequence: boolean
): string => {
	let filename = getUserPassedOutputLocation();
	let extension = getUserPassedFileExtension();
	if (imageSequence) {
		if (extension !== null) {
			Log.error(
				'The output directory of the image sequence cannot have an extension. Got: ' +
					extension
			);
			process.exit(1);
		}

		return filename;
	}

	if (extension === null && !imageSequence) {
		if (codec === 'h264' || codec === 'h265') {
			Log.info('No file extension specified, adding .mp4 automatically.');
			filename += '.mp4';
			extension = 'mp4';
		}

		if (codec === 'h264-mkv') {
			Log.info('No file extension specified, adding .mkv automatically.');
			filename += '.mkv';
			extension = 'mkv';
		}

		if (codec === 'vp8' || codec === 'vp9') {
			Log.info('No file extension specified, adding .webm automatically.');
			filename += '.webm';
			extension = 'webm';
		}

		if (codec === 'prores') {
			Log.info('No file extension specified, adding .mov automatically.');
			filename += '.mov';
			extension = 'mov';
		}
	}

	if (codec === 'h264') {
		if (extension !== 'mp4' && extension !== 'mkv') {
			Log.error(
				'When using the H264 codec, the output filename must end in .mp4 or .mkv.'
			);
			process.exit(1);
		}
	}

	if (codec === 'h265') {
		if (extension !== 'mp4' && extension !== 'hevc') {
			Log.error(
				'When using H265 codec, the output filename must end in .mp4 or .hevc.'
			);
			process.exit(1);
		}
	}

	if (codec === 'vp8' || codec === 'vp9') {
		if (extension !== 'webm') {
			Log.error(
				`When using the ${codec.toUpperCase()} codec, the output filename must end in .webm.`
			);
			process.exit(1);
		}
	}

	if (codec === 'prores') {
		const allowedProResExtensions = ['mov', 'mkv', 'mxf'];
		if (!extension || !allowedProResExtensions.includes(extension)) {
			Log.error(
				`When using the 'prores' codec, the output must end in one of those extensions: ${allowedProResExtensions
					.map((a) => `.${a}`)
					.join(', ')}`
			);
			process.exit(1);
		}
	}

	if (codec === 'mp3') {
		if (extension !== 'mp3') {
			Log.error("When using the 'mp3' codec, the output must end in .mp3");
			process.exit(1);
		}
	}

	if (codec === 'aac') {
		const allowedAacExtensions = ['aac', '3gp', 'm4a', 'm4b', 'mpg', 'mpeg'];
		if (!extension || !allowedAacExtensions.includes(extension)) {
			Log.error(
				`When using the 'aac' codec, the output must end in one of those extensions: ${allowedAacExtensions
					.map((a) => `.${a}`)
					.join(', ')}`
			);
			process.exit(1);
		}
	}

	if (codec === 'wav') {
		if (extension !== 'wav') {
			Log.error(
				"When using the 'wav' codec, the output locatio must end in .wav."
			);
			process.exit(1);
		}
	}

	return filename;
};
