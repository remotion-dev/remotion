/*
 * @description Widens an SVG viewBox in all directions by a certain scale factor.
 * @see [Documentation](https://www.remotion.dev/docs/paths/extend-viewbox)
 */
export const extendViewBox = (currentViewBox: string, scale: number) => {
	const relativeScale = scale - 1;
	const splitted = currentViewBox
		.trim()
		.split(/\s*,\s*|\s+/)
		.map((a) => (a === '' ? NaN : Number(a)));

	if (splitted.length !== 4) {
		throw new Error(
			`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`,
		);
	}

	for (const part of splitted) {
		if (Number.isNaN(part)) {
			throw new Error(
				`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`,
			);
		}

		if (!Number.isFinite(part)) {
			throw new Error(
				`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`,
			);
		}
	}

	const [x, y, width, height] = splitted;
	return [
		x - (relativeScale * width) / 2,
		y - (relativeScale * height) / 2,
		width + relativeScale * width,
		height + relativeScale * height,
	].join(' ');
};
