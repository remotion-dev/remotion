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

export type CssRotationEuler = readonly [number, number, number];

export const parseCssRotationToEuler = (value: string): CssRotationEuler => {
	const parsed = parseCssRotation(value);
	if (parsed === null) {
		return [0, 0, parseCssRotationToDegrees(value)];
	}

	const [axisX, axisY, axisZ] = parsed.axis;
	if (parsed.degrees === 0) {
		return [0, 0, 0];
	}

	if (axisY === 0 && axisZ === 0 && axisX !== 0) {
		return [Math.sign(axisX) * parsed.degrees, 0, 0];
	}

	if (axisX === 0 && axisZ === 0 && axisY !== 0) {
		return [0, Math.sign(axisY) * parsed.degrees, 0];
	}

	if (axisX === 0 && axisY === 0 && axisZ !== 0) {
		return [0, 0, Math.sign(axisZ) * parsed.degrees];
	}

	const axisLength = Math.hypot(axisX, axisY, axisZ);
	if (axisLength === 0) {
		return [0, 0, 0];
	}

	const halfAngle = (parsed.degrees * Math.PI) / 360;
	const sinHalfAngle = Math.sin(halfAngle);
	const quaternionX = (axisX / axisLength) * sinHalfAngle;
	const quaternionY = (axisY / axisLength) * sinHalfAngle;
	const quaternionZ = (axisZ / axisLength) * sinHalfAngle;
	const quaternionW = Math.cos(halfAngle);
	// Decompose the rotation using the same X → Y → Z order used when serializing.
	const matrix11 =
		1 - 2 * (quaternionY * quaternionY + quaternionZ * quaternionZ);
	const matrix12 = 2 * (quaternionX * quaternionY - quaternionZ * quaternionW);
	const matrix13 = 2 * (quaternionX * quaternionZ + quaternionY * quaternionW);
	const matrix22 =
		1 - 2 * (quaternionX * quaternionX + quaternionZ * quaternionZ);
	const matrix23 = 2 * (quaternionY * quaternionZ - quaternionX * quaternionW);
	const matrix32 = 2 * (quaternionY * quaternionZ + quaternionX * quaternionW);
	const matrix33 =
		1 - 2 * (quaternionX * quaternionX + quaternionY * quaternionY);
	const clampedMatrix13 = Math.max(-1, Math.min(1, matrix13));
	const rotationY = Math.asin(clampedMatrix13);
	const rotationX =
		Math.abs(clampedMatrix13) < 0.9999999
			? Math.atan2(-matrix23, matrix33)
			: Math.atan2(matrix32, matrix22);
	const rotationZ =
		Math.abs(clampedMatrix13) < 0.9999999 ? Math.atan2(-matrix12, matrix11) : 0;

	return [rotationX, rotationY, rotationZ].map((rotation) =>
		normalizeTimelineNumber(rotation * (180 / Math.PI)),
	) as [number, number, number];
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

export const serializeCssRotationFromEuler = ({
	rotation,
	decimalPlaces = 6,
}: {
	readonly rotation: CssRotationEuler;
	readonly decimalPlaces?: number;
}): string => {
	const [rotationX, rotationY, rotationZ] = rotation.map((value) =>
		normalizeTimelineNumber(value),
	) as [number, number, number];

	if (rotationY === 0 && rotationZ === 0) {
		return rotationX === 0
			? serializeCssRotation(0, decimalPlaces)
			: `x ${serializeCssRotation(rotationX, decimalPlaces)}`;
	}

	if (rotationX === 0 && rotationZ === 0) {
		return `y ${serializeCssRotation(rotationY, decimalPlaces)}`;
	}

	if (rotationX === 0 && rotationY === 0) {
		return serializeCssRotation(rotationZ, decimalPlaces);
	}

	const halfRotationX = (rotationX * Math.PI) / 360;
	const halfRotationY = (rotationY * Math.PI) / 360;
	const halfRotationZ = (rotationZ * Math.PI) / 360;
	const sinX = Math.sin(halfRotationX);
	const cosX = Math.cos(halfRotationX);
	const sinY = Math.sin(halfRotationY);
	const cosY = Math.cos(halfRotationY);
	const sinZ = Math.sin(halfRotationZ);
	const cosZ = Math.cos(halfRotationZ);
	// Compose the three editable angles into the axis-angle form CSS rotate accepts.
	const quaternionX = sinX * cosY * cosZ + cosX * sinY * sinZ;
	const quaternionY = cosX * sinY * cosZ - sinX * cosY * sinZ;
	const quaternionZ = cosX * cosY * sinZ + sinX * sinY * cosZ;
	const quaternionW = cosX * cosY * cosZ - sinX * sinY * sinZ;
	const angle = 2 * Math.acos(Math.max(-1, Math.min(1, quaternionW)));
	const sinHalfAngle = Math.sqrt(Math.max(0, 1 - quaternionW * quaternionW));
	if (sinHalfAngle < 0.0000001) {
		return serializeCssRotation(0, decimalPlaces);
	}

	return serializeCssRotation3d({
		axis: [
			quaternionX / sinHalfAngle,
			quaternionY / sinHalfAngle,
			quaternionZ / sinHalfAngle,
		],
		degrees: angle * (180 / Math.PI),
		decimalPlaces,
	});
};

export const serializeCssRotation = (
	value: number,
	decimalPlaces = 6,
): string => {
	const factor = 10 ** decimalPlaces;
	const rounded = Math.round(normalizeTimelineNumber(value) * factor) / factor;
	return `${Object.is(rounded, -0) ? 0 : rounded}deg`;
};
