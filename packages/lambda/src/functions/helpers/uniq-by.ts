export const uniqBy = <T>(arr: T[], predicate: (item: T) => string) => {
	const result: T[] = [];
	const map = new Map();

	arr.forEach((item) => {
		const key = item === null || item === undefined ? item : predicate(item);

		if (!map.has(key)) {
			map.set(key, item);
			result.push(item);
		}
	});

	return result;
};
