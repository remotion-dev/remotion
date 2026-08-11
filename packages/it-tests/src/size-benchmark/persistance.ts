import path from 'path';
import {BenchmarkItem, getBenchmarkKeyFromItem} from './types';

export const getBenchmarks = async (): Promise<BenchmarkItem[]> => {
	return (await Bun.file(
		path.join(__dirname, 'results.json'),
	).json()) as BenchmarkItem[];
};

export const saveBenchmark = async (items: BenchmarkItem[]) => {
	await Bun.write(
		path.join(__dirname, 'results.json'),
		JSON.stringify(items, null, 2),
	);
};

export const hasBenchmark = (
	items: BenchmarkItem[],
	key: string,
): BenchmarkItem | null => {
	return items.find((i) => getBenchmarkKeyFromItem(i) === key) ?? null;
};
