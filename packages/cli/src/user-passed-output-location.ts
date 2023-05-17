import {ConfigInternals} from './config';
import {getDefaultOutLocation} from './get-default-out-name';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = (args: string[]) => {
	const filename =
		args[0] ?? parsedCli.output ?? ConfigInternals.getOutputLocation();

	return filename;
};

export const getOutputLocation = ({
	compositionId,
	defaultExtension,
	args,
	type,
}: {
	compositionId: string;
	defaultExtension: string;
	args: string[];
	type: 'asset' | 'sequence';
}) => {
	if (
		typeof args[0] !== 'undefined' &&
		typeof parsedCli.output !== 'undefined'
	) {
		throw new Error(
			'You passed both an output flag (--output) and an output location as an positional argument. Choose only one of the ways.'
		);
	}

	return (
		getUserPassedOutputLocation(args) ??
		getDefaultOutLocation({
			compositionName: compositionId,
			defaultExtension,
			type,
		})
	);
};
