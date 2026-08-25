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

// Compare two histories, each pre-collapsed to parallel arrays of epochs and
// nonces sorted by descending epoch, without rebuilding a Map per comparison.
// Equivalent to getSharedEpochOrder: both find the newest shared epoch and
// compare its nonces.
const sharedEpochOrderFromSorted = (
	aEpochs: number[],
	aNonces: number[],
	bEpochs: number[],
	bNonces: number[],
): number | null => {
	let i = 0;
	let j = 0;
	while (i < aEpochs.length && j < bEpochs.length) {
		const ae = aEpochs[i];
		const be = bEpochs[j];
		if (ae === be) {
			return aNonces[i] - bNonces[j];
		}

		if (ae > be) {
			i++;
		} else {
			j++;
		}
	}

	return null;
};

export const sortItemsByNonceHistory: <T extends {nonce: NonceHistory}>(
	items: T[],
) => T[] = (items) => {
	const n = items.length;
	if (n <= 1) {
		return items.slice();
	}

	// Collapse each history once into epoch/nonce arrays sorted by descending
	// epoch. `new Map(nonce)` keeps the last value per duplicated epoch, matching
	// getSharedEpochOrder. This removes the per-pair Map/Set construction the
	// pairwise loop below would otherwise repeat O(n^2) times.
	const epochsOf: number[][] = new Array(n);
	const noncesOf: number[][] = new Array(n);
	for (let i = 0; i < n; i++) {
		const map = new Map(items[i].nonce);
		const epochs = [...map.keys()].sort((x, y) => y - x);
		epochsOf[i] = epochs;
		noncesOf[i] = epochs.map((e) => map.get(e)!);
	}

	// Pairwise "strictly before" relation, stored as bitsets: `before[i]` has
	// bit j set when i must come before j, `known[i]` has bit j set when the
	// pair (i, j) is directly determined by a shared epoch. Bitsets let the
	// transitive closure below combine 32 relationships per word.
	const words = (n + 31) >> 5;
	const before = new Uint32Array(n * words);
	const known = new Uint32Array(n * words);
	// Direct comparison sign per ordered pair; only read where `known` is set.
	const sign = new Int8Array(n * n);

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			const cmp = sharedEpochOrderFromSorted(
				epochsOf[i],
				noncesOf[i],
				epochsOf[j],
				noncesOf[j],
			);
			if (cmp === null) {
				continue;
			}

			known[i * words + (j >> 5)] |= 1 << (j & 31);
			known[j * words + (i >> 5)] |= 1 << (i & 31);
			sign[i * n + j] = cmp < 0 ? -1 : cmp > 0 ? 1 : 0;
			sign[j * n + i] = cmp < 0 ? 1 : cmp > 0 ? -1 : 0;
			if (cmp < 0) {
				before[i * words + (j >> 5)] |= 1 << (j & 31);
			} else if (cmp > 0) {
				before[j * words + (i >> 5)] |= 1 << (i & 31);
			}
		}
	}

	// Transitive closure: if i < k and k < j, then i < j. This is the same
	// Floyd-Warshall relation as before, but the inner sweep is bitwise
	// (`before[k] & ~known[i]` finds all reachable j at once). A newly derived
	// edge is marked known immediately so the first path decides an otherwise
	// undetermined pair — preserving behavior on the inputs where the pairwise
	// comparison is intentionally non-transitive.
	for (let k = 0; k < n; k++) {
		const kBase = k * words;
		const kWord = k >> 5;
		const kBit = 1 << (k & 31);
		for (let i = 0; i < n; i++) {
			if (i === k) {
				continue;
			}

			const iBase = i * words;
			if ((before[iBase + kWord] & kBit) === 0) {
				continue; // i is not before k, so k adds nothing for i
			}

			for (let w = 0; w < words; w++) {
				const add = before[kBase + w] & ~known[iBase + w];
				if (add === 0) {
					continue;
				}

				before[iBase + w] |= add;
				known[iBase + w] |= add;
				// Set the mirror relationship (j after i) for each newly known pair.
				let bits = add;
				while (bits !== 0) {
					const lowest = bits & -bits;
					const j = (w << 5) + (31 - Math.clz32(lowest));
					sign[i * n + j] = -1;
					known[j * words + (i >> 5)] |= 1 << (i & 31);
					sign[j * n + i] = 1;
					bits ^= lowest;
				}
			}
		}
	}

	const indexMap = new Map(items.map((item, i) => [item, i]));
	const result = items.slice();
	result.sort((a, b) => {
		const ai = indexMap.get(a)!;
		const bi = indexMap.get(b)!;

		if ((known[ai * words + (bi >> 5)] >> (bi & 31)) & 1) {
			return sign[ai * n + bi];
		}

		if ((before[ai * words + (bi >> 5)] >> (bi & 31)) & 1) {
			return -1;
		}

		if ((before[bi * words + (ai >> 5)] >> (ai & 31)) & 1) {
			return 1;
		}

		// No transitive relationship — lower latest epoch first
		return a.nonce[a.nonce.length - 1][0] - b.nonce[b.nonce.length - 1][0];
	});

	return result;
};
