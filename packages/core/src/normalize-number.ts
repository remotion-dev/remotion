export const normalizeNumber = (value: number): number => {
	return Math.round(value * 1000000) / 1000000;
};
