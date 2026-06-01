const PIXEL_PATTERN = /^(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?$/;

export const parseTranslate = (value: string): [number, number] => {
	const m = value.match(PIXEL_PATTERN);
	if (!m) {
		return [0, 0];
	}

	return [Number(m[1]), m[2] !== undefined ? Number(m[2]) : 0];
};

const formatTranslateCoordinate = (value: number): string => {
	const rounded = Math.round(value * 1000) / 1000;
	return String(Object.is(rounded, -0) ? 0 : rounded);
};

export const serializeTranslate = (x: number, y: number): string => {
	return `${formatTranslateCoordinate(x)}px ${formatTranslateCoordinate(y)}px`;
};
