import {normalizeTimelineNumber} from './timeline-field-utils';

const unitPattern = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/;

const unitToDegrees: Record<string, number> = {
	deg: 1,
	rad: 180 / Math.PI,
	turn: 360,
	grad: 360 / 400,
};

export type ParsedCssRotation = {
	readonly axis: readonly [number, number, number];
	readonly degrees: number;
};

export const parseCssRotation = (value: string): ParsedCssRotation | null => {
	const trimmed = value.trim();
	const bareAngle = trimmed.match(unitPattern);
	if (bareAngle) {
		return {
			axis: [0, 0, 1],
			degrees: normalizeTimelineNumber(
				Number(bareAngle[1]) * unitToDegrees[bareAngle[2]],
			),
		};
	}

	const keywordAxis = /^(x|y|z)\s+(.+)$/i.exec(trimmed);
	if (keywordAxis) {
		const keywordAngle = keywordAxis[2].match(unitPattern);
		if (!keywordAngle) {
			return null;
		}

		const keywordAxisName = keywordAxis[1].toLowerCase();
		return {
			axis:
				keywordAxisName === 'x'
					? [1, 0, 0]
					: keywordAxisName === 'y'
						? [0, 1, 0]
						: [0, 0, 1],
			degrees: normalizeTimelineNumber(
				Number(keywordAngle[1]) * unitToDegrees[keywordAngle[2]],
			),
		};
	}

	const vectorAxis = /^(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/.exec(trimmed);
	if (!vectorAxis) {
		return null;
	}

	const vectorAxisComponents = [
		Number(vectorAxis[1]),
		Number(vectorAxis[2]),
		Number(vectorAxis[3]),
	] as const;
	const vectorAngle = vectorAxis[4].match(unitPattern);
	if (!vectorAxisComponents.every(Number.isFinite) || !vectorAngle) {
		return null;
	}

	return {
		axis: vectorAxisComponents,
		degrees: normalizeTimelineNumber(
			Number(vectorAngle[1]) * unitToDegrees[vectorAngle[2]],
		),
	};
};

export const parseCssRotationToDegrees = (value: string): number => {
	const parsed = parseCssRotation(value);
	if (parsed) {
		return parsed.degrees;
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

export const serializeCssRotation3d = ({
	axis,
	degrees,
	decimalPlaces = 6,
}: {
	readonly axis: readonly [number, number, number];
	readonly degrees: number;
	readonly decimalPlaces?: number;
}): string => {
	const factor = 10 ** decimalPlaces;
	const values = [...axis, degrees].map((value) => {
		const rounded =
			Math.round(normalizeTimelineNumber(value) * factor) / factor;
		return Object.is(rounded, -0) ? 0 : rounded;
	});

	return `${values[0]} ${values[1]} ${values[2]} ${values[3]}deg`;
};

export const serializeCssRotation = (
	value: number,
	decimalPlaces = 6,
): string => {
	const factor = 10 ** decimalPlaces;
	const rounded = Math.round(normalizeTimelineNumber(value) * factor) / factor;
	return `${Object.is(rounded, -0) ? 0 : rounded}deg`;
};
