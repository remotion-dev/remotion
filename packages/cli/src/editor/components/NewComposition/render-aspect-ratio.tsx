export const aspectRatio = (ratio: number) => {
	if (ratio === 16 / 9) {
		return '16:9';
	}

	if (ratio === 5 / 4) {
		return '5:4';
	}

	return ratio.toFixed(2);
};
