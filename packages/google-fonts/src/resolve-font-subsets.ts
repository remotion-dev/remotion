const isChunkSubset = (subset: string) => /^\[\d+\]$/.test(subset);

const compareChunkSubsets = (a: string, b: string) => {
	return Number(a.slice(1, -1)) - Number(b.slice(1, -1));
};

/**
 * Maps a requested subset name to concrete keys in font metadata.
 * When Google Fonts ships a subset only as numbered unicode-range chunks (typical for CJK),
 * declared subset names appear in `meta.subsets` but not under `fonts[style][weight]`.
 * In that case we expand to every `[n]` chunk key present for that weight.
 */
export const resolveFontSubsetKeys = ({
	availableSubsetKeys,
	metaSubsets,
	requestedSubset,
}: {
	availableSubsetKeys: string[];
	metaSubsets: string[];
	requestedSubset: string;
}) => {
	if (availableSubsetKeys.includes(requestedSubset)) {
		return [requestedSubset];
	}

	if (!metaSubsets.includes(requestedSubset)) {
		return [requestedSubset];
	}

	const chunkSubsets = availableSubsetKeys
		.filter(isChunkSubset)
		.sort(compareChunkSubsets);

	return chunkSubsets.length === 0 ? [requestedSubset] : chunkSubsets;
};
