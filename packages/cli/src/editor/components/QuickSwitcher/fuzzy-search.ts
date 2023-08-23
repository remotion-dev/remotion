import type {TQuickSwitcherResult} from './QuickSwitcherResult';

export function fuzzySearch(
	query: string,
	dataset: TQuickSwitcherResult[],
): TQuickSwitcherResult[] {
	const q = query ? query.trim().toLowerCase() : '';

	const matchingIndices: number[] = [];
	if (q.length === 0) {
		for (let i = 0; i < dataset.length; i++) {
			matchingIndices.push(i);
		}

		return dataset.filter((_, i) => matchingIndices.includes(i));
	}

	dataset.forEach((d, index) => {
		const s = d.title.trim().toLowerCase();
		let i = 0;
		let n = -1;
		let l;
		// eslint-disable-next-line no-bitwise
		for (; (l = q[i++]); ) if (!~(n = s.indexOf(l, n + 1))) return;
		matchingIndices.push(index);
	});
	return dataset.filter((_, i) => matchingIndices.includes(i));
}
