export const getFramesToRender = (
	frameRange: [number, number],
	everyNthFrame: number,
): number[] => {
	if (everyNthFrame === 0) {
		throw new Error('everyNthFrame cannot be 0');
	}

	return new Array(frameRange[1] - frameRange[0] + 1)
		.fill(true)
		.map((_, index) => {
			return index + frameRange[0];
		})
		.filter((frame) => {
			return (frame - frameRange[0]) % everyNthFrame === 0;
		});
};
