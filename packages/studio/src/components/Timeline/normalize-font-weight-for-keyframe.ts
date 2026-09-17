export const normalizeFontWeightForKeyframe = (
	value: unknown,
): number | null => {
	if (value === 'normal') {
		return 400;
	}

	if (value === 'bold') {
		return 700;
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) {
		return Number(value);
	}

	return null;
};
