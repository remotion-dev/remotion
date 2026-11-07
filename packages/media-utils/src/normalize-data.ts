export const normalizeData = (filteredData: number[]) => {
	let max = -Infinity;
	for (const value of filteredData) {
		if (value > max) {
			max = value;
		}
	}

	const multiplier = max === 0 ? 0 : max ** -1;
	return filteredData.map((n) => n * multiplier);
};
