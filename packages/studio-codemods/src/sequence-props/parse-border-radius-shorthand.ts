export type ParsedBorderRadiusShorthand = {
	borderTopLeftRadius: number;
	borderTopRightRadius: number;
	borderBottomRightRadius: number;
	borderBottomLeftRadius: number;
};

const parsePixelRadius = (value: string): number | null => {
	if (value === '0') {
		return 0;
	}

	const match = value.match(/^(\d+(?:\.\d+)?|\.\d+)px$/i);
	return match ? Number(match[1]) : null;
};

const expandBorderRadius = (
	values: readonly number[],
): readonly [number, number, number, number] => {
	if (values.length === 1) {
		return [values[0], values[0], values[0], values[0]];
	}

	if (values.length === 2) {
		return [values[0], values[1], values[0], values[1]];
	}

	if (values.length === 3) {
		return [values[0], values[1], values[2], values[1]];
	}

	return [values[0], values[1], values[2], values[3]];
};

export const parseBorderRadiusShorthand = (
	value: unknown,
): ParsedBorderRadiusShorthand | null => {
	let values: readonly number[];
	if (typeof value === 'number') {
		if (!Number.isFinite(value) || value < 0) {
			return null;
		}

		values = [value];
	} else if (typeof value === 'string') {
		const tokens = value.trim().split(/\s+/);
		if (tokens.length < 1 || tokens.length > 4) {
			return null;
		}

		const parsed = tokens.map(parsePixelRadius);
		if (parsed.some((radius) => radius === null)) {
			return null;
		}

		values = parsed as number[];
	} else {
		return null;
	}

	const [topLeft, topRight, bottomRight, bottomLeft] =
		expandBorderRadius(values);
	return {
		borderTopLeftRadius: topLeft,
		borderTopRightRadius: topRight,
		borderBottomRightRadius: bottomRight,
		borderBottomLeftRadius: bottomLeft,
	};
};
