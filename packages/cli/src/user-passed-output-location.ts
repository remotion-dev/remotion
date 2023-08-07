import {ConfigInternals} from './config';
import {getDefaultOutLocation} from './get-default-out-name';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = (
	args: string[],
	uiPassedOutName: string | null
) => {
	const filename =
		uiPassedOutName ??
		args[0] ??
		parsedCli.output ??
		ConfigInternals.getOutputLocation();

	return filename;
};

export const getOutputLocation = ({
	compositionId,
	defaultExtension,
	args,
	type,
	outputLocationFromUi,
}: {
	compositionId: string;
	outputLocationFromUi: string | null;
	defaultExtension: string;
	args: string[];
	type: 'asset' | 'sequence';
}) => {
	if (
		typeof args[0] !== 'undefined' &&
		typeof parsedCli.output !== 'undefined'
	) {
		throw new Error(
			'Both an output flag (--output) and an output location as a positional argument were passed. Please choose only one of the ways.'
		);
	}

	return (
		getUserPassedOutputLocation(args, outputLocationFromUi) ??
		getDefaultOutLocation({
			compositionName: compositionId,
			defaultExtension,
			type,
		})
	);
};
