export const getDefaultOutLocation = ({
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
