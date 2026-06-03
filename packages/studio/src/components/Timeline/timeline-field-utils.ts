export const getDecimalPlaces = (num: number): number => {
	const str = String(num);
	const decimalIndex = str.indexOf('.');
	return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
};

export const normalizeTimelineNumber = (value: number): number => {
	return Math.round(value * 1000000) / 1000000;
};

export const draggerStyle: React.CSSProperties = {
	width: 80,
};
