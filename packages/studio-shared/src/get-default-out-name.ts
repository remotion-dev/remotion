const hasFileExtension = (location: string): boolean => {
	const lastSegment = location.split('/').pop() ?? location;
	return lastSegment.includes('.');
};

export const getDefaultOutLocation = ({
	compositionName,
	defaultExtension,
	type,
	compositionDefaultOutName,
	outputLocation,
}: {
	compositionName: string;
	compositionDefaultOutName: string | null;
	defaultExtension: string;
	type: 'asset' | 'sequence';
	outputLocation?: string | null;
}) => {
	if (outputLocation && hasFileExtension(outputLocation)) {
		return outputLocation;
	}

	const base = outputLocation ?? 'out';
	const dir = base.endsWith('/') ? base : `${base}/`;
	const nameToUse = compositionDefaultOutName ?? compositionName;

	if (type === 'sequence') {
		return `${dir}${nameToUse}`;
	}

	return `${dir}${nameToUse}.${defaultExtension}`;
};
