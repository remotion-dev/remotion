export const getDefaultOutLocation = ({
	compositionName,
	defaultExtension,
	type,
	compositionDefaultOutName,
	clientSideRender,
}: {
	compositionName: string;
	compositionDefaultOutName: string | null;
	defaultExtension: string;
	type: 'asset' | 'sequence';
	clientSideRender: boolean;
}) => {
	const nameToUse = compositionDefaultOutName ?? compositionName;

	if (type === 'sequence') {
		if (clientSideRender) {
			return nameToUse;
		}

		return `out/${nameToUse}`;
	}

	if (clientSideRender) {
		return `${nameToUse}.${defaultExtension}`;
	}

	return `out/${nameToUse}.${defaultExtension}`;
};
