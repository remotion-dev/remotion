import {RenderInternals} from '@remotion/renderer';
import type {Codec} from 'remotion';
import {Log} from './log';
import {getUserPassedOutputLocation} from './user-passed-output-location';

export const getOutputFilename = ({
	codec,
	imageSequence,
	type,
	compositionName,
}: {
	codec: Codec;
	imageSequence: boolean;
	type: 'still' | 'series';
	compositionName: string;
}): string => {
	let filename = getUserPassedOutputLocation(
		RenderInternals.getFileExtensionFromCodec(codec, 'final'),
		compositionName
	);
	if (type === 'still') {
		return filename;
	}

	let extension = RenderInternals.getExtensionOfFilename(filename);
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
			Log.warn('No file extension specified, adding .mp4 automatically.');
			filename += '.mp4';
			extension = 'mp4';
		}

		if (codec === 'h264-mkv') {
			Log.warn('No file extension specified, adding .mkv automatically.');
			filename += '.mkv';
			extension = 'mkv';
		}

		if (codec === 'vp8' || codec === 'vp9') {
			Log.warn('No file extension specified, adding .webm automatically.');
			filename += '.webm';
			extension = 'webm';
		}

		if (codec === 'prores') {
			Log.warn('No file extension specified, adding .mov automatically.');
			filename += '.mov';
			extension = 'mov';
		}
	}

	return filename;
};
