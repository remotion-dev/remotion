export function chunk<T>(array: T[], chunkSize: number): T[][] {
	const R = [];
	for (let i = 0, len = array.length; i < len; i += chunkSize)
		// @ts-expect-error
		R.push(array.slice(i, i + chunkSize));
	return R;
}
