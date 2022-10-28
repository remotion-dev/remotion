import {ConfigInternals} from './config';

export const getUserPassedOutputLocation = (args: string[]) => {
	const filename = args ? args[0] : ConfigInternals.getOutputLocation();

	return filename;
};

const getDefaultOutLocation = ({
	compositionName,
	defaultExtension,
}: {
	compositionName: string;
	defaultExtension: string;
}) => {
	const defaultName = `out/${compositionName}.${defaultExtension}`;

	return defaultName;
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
