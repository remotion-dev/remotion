import {getDefaultOutLocation} from '@remotion/studio-server';
import {ConfigInternals} from './config';
import {parsedCli} from './parsed-cli';

export const getUserPassedOutputLocation = (
	args: (string | number)[],
	uiPassedOutName: string | null,
) => {
	const filename =
		uiPassedOutName ??
		args[0] ??
		parsedCli.output ??
		ConfigInternals.getOutputLocation();

	return filename ? String(filename) : null;
};

export const getOutputLocation = ({
	compositionId,
	defaultExtension,
	args,
	type,
	outputLocationFromUi,
	compositionDefaultOutName,
}: {
	compositionId: string;
	outputLocationFromUi: string | null;
	compositionDefaultOutName: string | null;
	defaultExtension: string;
	args: (string | number)[];
	type: 'asset' | 'sequence';
}) => {
	if (
		typeof args[0] !== 'undefined' &&
		typeof parsedCli.output !== 'undefined'
	) {
		throw new Error(
			'Both an output flag (--output) and an output location as a positional argument were passed. Please choose only one of the ways.',
		);
	}

	return (
		getUserPassedOutputLocation(args, outputLocationFromUi) ??
		getDefaultOutLocation({
			compositionName: compositionId,
			defaultExtension,
			type,
			compositionDefaultOutName,
		})
	);
};
