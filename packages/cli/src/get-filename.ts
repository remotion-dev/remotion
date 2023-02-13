import {RenderInternals} from '@remotion/renderer';
import {Log} from './log';
import {getOutputLocation} from './user-passed-output-location';

export const getOutputFilename = ({
	imageSequence,
	compositionName,
	defaultExtension,
	args,
}: {
	imageSequence: boolean;
	compositionName: string;
	defaultExtension: string;
	args: string[];
}): string => {
	const filename = getOutputLocation({
		compositionId: compositionName,
		defaultExtension,
		args,
		type: imageSequence ? 'sequence' : 'asset',
	});

	const extension = RenderInternals.getExtensionOfFilename(filename);
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
		Log.warn(
			`No file extension specified, adding ${defaultExtension} automatically.`
		);
		return `${filename}.${defaultExtension}`;
	}

	return filename;
};
