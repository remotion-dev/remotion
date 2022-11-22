export const determineResizeParams = (
	needsResize: [number, number] | null
): string[] => {
	if (needsResize === null) {
		return [];
	}

	return ['-s', `${needsResize[0]}x${needsResize[1]}`];
};
