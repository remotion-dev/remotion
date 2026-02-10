export const getDefaultOutLocation = ({
	compositionName,
	defaultExtension,
	type,
	compositionDefaultOutName,
}: {
	compositionName: string;
	compositionDefaultOutName: string | null;
	defaultExtension: string;
	type: 'asset' | 'sequence';
}) => {
	const nameToUse = compositionDefaultOutName ?? compositionName;

	if (type === 'sequence') {
		return `out/${nameToUse}`;
	}

	return `out/${nameToUse}.${defaultExtension}`;
};
