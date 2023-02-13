import {ConfigInternals} from './config';

export const getUserPassedOutputLocation = (args: string[]) => {
	const filename = args[0] ?? ConfigInternals.getOutputLocation();

	return filename;
};

const getDefaultOutLocation = ({
	compositionName,
	defaultExtension,
	type,
}: {
	compositionName: string;
	defaultExtension: string;
	type: 'asset' | 'sequence';
}) => {
	if (type === 'sequence') {
		return `out/${compositionName}`;
	}

	return `out/${compositionName}.${defaultExtension}`;
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
	return (
		getUserPassedOutputLocation(args) ??
		getDefaultOutLocation({
			compositionName: compositionId,
			defaultExtension,
			type,
		})
	);
};
