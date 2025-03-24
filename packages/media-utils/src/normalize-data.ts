export const normalizeData = (filteredData: number[]) => {
	const max = Math.max(...filteredData);
	const multiplier = max === 0 ? 0 : max ** -1;
	return filteredData.map((n) => n * multiplier);
};
