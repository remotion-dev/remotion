import {normalizeTimelineNumber} from './timeline-field-utils';

const unitPattern = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/;

const unitToDegrees: Record<string, number> = {
	deg: 1,
	rad: 180 / Math.PI,
	turn: 360,
	grad: 360 / 400,
};

export const parseCssRotationToDegrees = (value: string): number => {
	const match = value.trim().match(unitPattern);
	if (match) {
		return normalizeTimelineNumber(Number(match[1]) * unitToDegrees[match[2]]);
	}

	if (typeof DOMMatrix === 'undefined') {
		return 0;
	}

	try {
		const m = new DOMMatrix(`rotate(${value})`);
		return normalizeTimelineNumber(Math.atan2(m.b, m.a) * (180 / Math.PI));
	} catch {
		return 0;
	}
};

export const serializeCssRotation = (
	value: number,
	decimalPlaces = 6,
): string => {
	const factor = 10 ** decimalPlaces;
	const rounded = Math.round(normalizeTimelineNumber(value) * factor) / factor;
	return `${Object.is(rounded, -0) ? 0 : rounded}deg`;
};
