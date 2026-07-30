type FontStretchOption = {
	keyword: CanvasFontStretch;
	percentage: number;
};

const fontStretchOptions = [
	{keyword: 'ultra-condensed', percentage: 50},
	{keyword: 'extra-condensed', percentage: 62.5},
	{keyword: 'condensed', percentage: 75},
	{keyword: 'semi-condensed', percentage: 87.5},
	{keyword: 'normal', percentage: 100},
	{keyword: 'semi-expanded', percentage: 112.5},
	{keyword: 'expanded', percentage: 125},
	{keyword: 'extra-expanded', percentage: 150},
	{keyword: 'ultra-expanded', percentage: 200},
] as const satisfies readonly FontStretchOption[];

export const getCanvasFontStretch = (
	fontStretch: string,
): CanvasFontStretch => {
	const keyword = fontStretchOptions.find(
		(option) => option.keyword === fontStretch,
	);
	if (keyword) {
		return keyword.keyword;
	}

	const percentage = Number.parseFloat(fontStretch);
	if (!Number.isFinite(percentage)) {
		return 'normal';
	}

	let closest: FontStretchOption = fontStretchOptions[0];
	for (const option of fontStretchOptions.slice(1)) {
		const distance = Math.abs(option.percentage - percentage);
		const closestDistance = Math.abs(closest.percentage - percentage);
		if (
			distance < closestDistance ||
			(distance === closestDistance && percentage >= 100)
		) {
			closest = option;
		}
	}

	return closest.keyword;
};
