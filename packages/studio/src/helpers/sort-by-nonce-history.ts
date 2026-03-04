import type {NonceHistory} from 'remotion';

const getSharedEpochOrder = (
	a: NonceHistory,
	b: NonceHistory,
): number | null => {
	const aMap = new Map(a);
	const bMap = new Map(b);

	const allEpochs = [...new Set([...aMap.keys(), ...bMap.keys()])].sort(
		(x, y) => y - x,
	);

	for (const epoch of allEpochs) {
		const aNonce = aMap.get(epoch);
		const bNonce = bMap.get(epoch);

		if (aNonce !== undefined && bNonce !== undefined) {
			return aNonce - bNonce;
		}
	}

	return null;
};

export const compareNonceHistories = (
	a: NonceHistory,
	b: NonceHistory,
): number => {
	const shared = getSharedEpochOrder(a, b);
	if (shared !== null) {
		return shared;
	}

	// No shared epoch — items from a lower latest epoch come first
	const aLatestEpoch = a[a.length - 1][0];
	const bLatestEpoch = b[b.length - 1][0];
	return aLatestEpoch - bLatestEpoch;
};

export const sortItemsByNonceHistory: <T extends {nonce: NonceHistory}>(
	items: T[],
) => T[] = (items) => {
	const n = items.length;
	if (n <= 1) {
		return items.slice();
	}

	// Build a pairwise ordering matrix from shared epochs.
	// order[i][j] < 0 means i before j, > 0 means j before i, null means no direct relationship.
	const order: (number | null)[][] = Array.from({length: n}, () =>
		Array(n).fill(null),
	);

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const cmp = getSharedEpochOrder(items[i].nonce, items[j].nonce);
			order[i][j] = cmp;
			order[j][i] = cmp !== null ? -cmp : null;
		}
	}

	// Compute transitive closure: if i < j and j < k, then i < k.
	for (let k = 0; k < n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (
					order[i][j] === null &&
					order[i][k] !== null &&
					order[k][j] !== null &&
					order[i][k]! < 0 &&
					order[k][j]! < 0
				) {
					order[i][j] = -1;
					order[j][i] = 1;
				}
			}
		}
	}

	// Sort using transitive order, falling back to lower latest epoch first.
	const indexMap = new Map(items.map((item, i) => [item, i]));
	const result = items.slice();
	result.sort((a, b) => {
		const ai = indexMap.get(a)!;
		const bi = indexMap.get(b)!;
		const transitiveOrder = order[ai][bi];
		if (transitiveOrder !== null) {
			return transitiveOrder;
		}

		// No transitive relationship — lower latest epoch first
		return a.nonce[a.nonce.length - 1][0] - b.nonce[b.nonce.length - 1][0];
	});

	return result;
};
