import {ConfigInternals} from '@remotion/config';
import {parsedCli} from './parse-command-line';

export const getUserPassedOutputLocation = () => {
	const filename = parsedCli._[3]
		? parsedCli._[3]
		: ConfigInternals.getOutputLocation();

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
}: {
	compositionId: string;
	defaultExtension: string;
}) => {
	return (
		getUserPassedOutputLocation() ??
		getDefaultOutLocation({compositionName: compositionId, defaultExtension})
	);
};
