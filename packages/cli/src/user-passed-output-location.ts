import {ConfigInternals} from './config';
import {getDefaultOutLocation} from './get-default-out-name';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = (args: string[]) => {
	const filename = args[0] ?? ConfigInternals.getOutputLocation();

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
	if (typeof args[0] !== 'undefined' && typeof parsedCli.output !== 'undefined')
		Log.warn(
			'You passed both an output flag (--output) and an output location as an argument. The output flag will be ignored.'
		);

	return (
		getUserPassedOutputLocation(args) ??
		getDefaultOutLocation({
			compositionName: compositionId,
			defaultExtension,
			type,
		})
	);
};
