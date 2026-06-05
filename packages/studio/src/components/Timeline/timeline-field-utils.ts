export const getDecimalPlaces = (num: number): number => {
	const [coefficient, exponent] = String(num).toLowerCase().split('e');
	const decimalIndex = coefficient.indexOf('.');
	const coefficientDecimals =
		decimalIndex === -1 ? 0 : coefficient.length - decimalIndex - 1;

	if (exponent === undefined) {
		return coefficientDecimals;
	}

	return Math.max(0, coefficientDecimals - Number(exponent));
};

export const getTimelineDisplayDecimalPlaces = ({
	defaultDecimalPlaces,
	step,
}: {
	readonly defaultDecimalPlaces: number;
	readonly step: number | undefined;
}): number => {
	return Math.max(
		defaultDecimalPlaces,
		step === undefined ? 0 : getDecimalPlaces(step),
	);
};

export const roundToDecimalPlaces = (
	value: number,
	decimalPlaces: number,
): number => {
	const factor = 10 ** decimalPlaces;
	const rounded = Math.round(value * factor) / factor;
	return Object.is(rounded, -0) ? 0 : rounded;
};

export const formatTimelineNumber = ({
	decimalPlaces,
	fixed,
	value,
}: {
	readonly decimalPlaces: number;
	readonly fixed: boolean;
	readonly value: number | string;
}): string => {
	const rounded = roundToDecimalPlaces(Number(value), decimalPlaces);
	return fixed && decimalPlaces > 0
		? rounded.toFixed(decimalPlaces)
		: String(rounded);
};

export const normalizeTimelineNumber = (value: number): number => {
	return roundToDecimalPlaces(value, 6);
};

export const draggerStyle: React.CSSProperties = {
	width: 80,
};
