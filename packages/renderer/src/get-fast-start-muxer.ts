export type FastStartMuxer = 'mov' | 'mp4';

export const getFastStartMuxer = (
	outputExtension: string,
): FastStartMuxer | null => {
	const normalizedExtension = outputExtension.toLowerCase();

	if (normalizedExtension === 'mp4' || normalizedExtension === 'mov') {
		return normalizedExtension;
	}

	return null;
};
