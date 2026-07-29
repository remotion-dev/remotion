import type {CSSProperties} from 'react';

export type ResolvedSequenceCrop = {
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly bottom: number;
};

type ResolvedSequenceCropWithStyle = ResolvedSequenceCrop & {
	readonly style: CSSProperties | null | undefined;
};

export type SequenceCropInput = {
	readonly cropLeft?: number;
	readonly cropRight?: number;
	readonly cropTop?: number;
	readonly cropBottom?: number;
};

const clampCrop = (value: number | undefined): number => {
	return Math.min(1, Math.max(0, value ?? 0));
};

const resolveAxis = (
	start: number | undefined,
	end: number | undefined,
): readonly [number, number] => {
	const resolvedStart = clampCrop(start);
	const resolvedEnd = clampCrop(end);

	if (resolvedStart + resolvedEnd > 1) {
		return [0.5, 0.5];
	}

	return [resolvedStart, resolvedEnd];
};

export const resolveSequenceCrop = ({
	cropLeft,
	cropRight,
	cropTop,
	cropBottom,
}: SequenceCropInput): ResolvedSequenceCrop => {
	const [left, right] = resolveAxis(cropLeft, cropRight);
	const [top, bottom] = resolveAxis(cropTop, cropBottom);

	return {left, right, top, bottom};
};

export const getSequenceCropClipPath = ({
	left,
	right,
	top,
	bottom,
	style,
}: ResolvedSequenceCropWithStyle): string | null => {
	if (left === 0 && right === 0 && top === 0 && bottom === 0) {
		return null;
	}

	const serializeRadius = (radius: string | number | undefined) =>
		typeof radius === 'number' ? `${radius}px` : radius;
	const shorthand = serializeRadius(style?.borderRadius);
	const longhands = [
		style?.borderTopLeftRadius,
		style?.borderTopRightRadius,
		style?.borderBottomRightRadius,
		style?.borderBottomLeftRadius,
	];
	const serializedBorderRadius =
		shorthand ||
		(longhands.some((radius) => radius !== undefined)
			? longhands.map((radius) => serializeRadius(radius) ?? '0px').join(' ')
			: undefined);
	const rounded = serializedBorderRadius
		? ` round ${serializedBorderRadius}`
		: '';

	return `inset(${top * 100}% ${right * 100}% ${bottom * 100}% ${left * 100}%${rounded})`;
};

export const validateSequenceCrop = (
	crop: SequenceCropInput,
	componentName = '<Sequence />',
): void => {
	for (const [name, value] of Object.entries(crop)) {
		if (value === undefined) {
			continue;
		}

		if (typeof value !== 'number' || !Number.isFinite(value)) {
			throw new TypeError(
				`The "${name}" prop of ${componentName} must be a finite number, but got ${String(value)}.`,
			);
		}

		if (value < 0 || value > 1) {
			throw new RangeError(
				`The "${name}" prop of ${componentName} must be between 0 and 1, but got ${value}.`,
			);
		}
	}
};
