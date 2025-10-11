export const toUnixTimestamp = (value: number): number | null => {
	if (value === 0) {
		return null;
	}

	const baseDate = new Date('1904-01-01T00:00:00Z');

	return Math.floor(value + baseDate.getTime() / 1000) * 1000;
};
