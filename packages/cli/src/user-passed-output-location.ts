import {ConfigInternals} from './config';
import {getDefaultOutLocation} from './get-default-out-name';

export const getUserPassedOutputLocation = (args: string[]) => {
	const filename = args[0] ?? ConfigInternals.getOutputLocation();

	return filename;
};

export const getOutputLocation = ({
	compositionId,
	defaultExtension,
	args,
}: {
	compositionId: string;
	defaultExtension: string;
	args: string[];
}) => {
	return (
		getUserPassedOutputLocation(args) ??
		getDefaultOutLocation({compositionName: compositionId, defaultExtension})
	);
};
