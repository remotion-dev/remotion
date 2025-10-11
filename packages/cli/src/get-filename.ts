import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {Log} from './log';
import {getOutputLocation} from './user-passed-output-location';

export const getOutputFilename = ({
	imageSequence,
	compositionName,
	compositionDefaultOutName,
	defaultExtension,
	args,
	fromUi,
	indent,
	logLevel,
}: {
	imageSequence: boolean;
	compositionName: string;
	compositionDefaultOutName: string | null;
	defaultExtension: string;
	args: (string | number)[];
	fromUi: string | null;
	indent: boolean;
	logLevel: LogLevel;
}): string => {
	if (fromUi) {
		return fromUi;
	}

	const filename = getOutputLocation({
		compositionId: compositionName,
		defaultExtension,
		args,
		type: imageSequence ? 'sequence' : 'asset',
		outputLocationFromUi: null,
		compositionDefaultOutName,
	});

	const extension = RenderInternals.getExtensionOfFilename(String(filename));
	if (imageSequence) {
		if (extension !== null) {
			throw new Error(
				'The output directory of the image sequence cannot have an extension. Got: ' +
					extension,
			);
		}

		return String(filename);
	}

	if (extension === null && !imageSequence) {
		Log.warn(
			{indent, logLevel},
			`No file extension specified, adding ${defaultExtension} automatically.`,
		);
		return `${filename}.${defaultExtension}`;
	}

	return String(filename);
};
