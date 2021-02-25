import {Codec} from 'remotion';
import {
	getUserPassedFileExtension,
	getUserPassedOutputLocation,
} from './user-passed-output-location';

export const getOutputFilename = (
	codec: Codec,
	imageSequence: boolean
): string => {
	let filename = getUserPassedOutputLocation();
	let extension = getUserPassedFileExtension();
	if (imageSequence && extension !== null) {
		if (extension !== null) {
			console.error(
				'The output directory of the image sequence cannot have an extension. Got: ' +
					extension
			);
			process.exit(1);
		}
		return filename;
	}
	if (extension === null && !imageSequence) {
		if (codec === 'h264' || codec === 'h265') {
			console.info('No file extension specified, adding .mp4 automatically.');
			filename += '.mp4';
			extension = 'mp4';
		}
		if (codec === 'vp8' || codec === 'vp9') {
			console.info('No file extension specified, adding .webm automatically.');
			filename += '.webm';
			extension = 'webm';
		}
	}
	if (codec === 'h264') {
		if (extension !== 'mp4') {
			console.error(
				'When using the H264 codec, the output filename must end in .mp4.'
			);
			process.exit(1);
		}
	}
	if (codec === 'h265') {
		if (extension !== 'mp4' && extension !== 'hevc') {
			console.error(
				'When using H265 codec, the output filename must end in .mp4 or .hevc.'
			);
			process.exit(1);
		}
	}
	if (codec === 'vp8' || codec === 'vp9') {
		if (extension !== 'webm') {
			console.error(
				`When using the ${codec.toUpperCase()} codec, the output filename must end in .webm.`
			);
			process.exit(1);
		}
	}

	return filename;
};
