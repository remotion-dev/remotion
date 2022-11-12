export const getDefaultOutLocation = ({
	compositionName,
	defaultExtension,
}: {
	compositionName: string;
	defaultExtension: string;
}) => {
	const defaultName = `out/${compositionName}.${defaultExtension}`;

	return defaultName;
};
