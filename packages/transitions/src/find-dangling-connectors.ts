export type TransitionSeriesChildKind = 'sequence' | 'connector' | 'other';

// A <TransitionSeries> alternates sequences with transitions and overlays
// ("connectors"). Given the children of a series and which of them are being
// deleted, returns the indices of the connectors that no longer sit between
// two sequences once the deleted children are gone, and so have to go as
// well: the series rejects two connectors in a row and an overlay at its start
// or end. Only connectors next to a deleted child are considered, so a series
// that was already irregular is left as it is.
// The source codemod (`findDanglingTransitionSeriesConnectors` in
// @remotion/codemods) applies the same rule to the file; keep the two in sync.
export const findDanglingConnectors = ({
	kinds,
	deleted,
}: {
	kinds: readonly TransitionSeriesChildKind[];
	deleted: readonly boolean[];
}): number[] => {
	const gone = [...deleted];
	const dangling: number[] = [];
	let changed = true;
	while (changed) {
		changed = false;
		// Right to left, so that of two connectors left next to each other the
		// later one goes: a deleted sequence takes the connector that followed it.
		for (let i = kinds.length - 1; i >= 0; i--) {
			if (kinds[i] !== 'connector' || gone[i]) {
				continue;
			}

			if (!(gone[i - 1] ?? false) && !(gone[i + 1] ?? false)) {
				continue;
			}

			let left = i - 1;
			while (left >= 0 && gone[left]) {
				left--;
			}

			let right = i + 1;
			while (right < kinds.length && gone[right]) {
				right++;
			}

			// A connector may stay between two sequences, or at the start or end
			// of the series if it already was there (an entrance or exit
			// transition). Of two connectors left next to each other, the one
			// that still sits at its original edge stays and the other one goes,
			// unless both do: then the series has no sequence left between them.
			const atStart = left < 0 && i === 0;
			const atEnd = right >= kinds.length && i === kinds.length - 1;
			const leftOk =
				left < 0
					? i === 0
					: kinds[left] !== 'connector' || (atEnd && left !== 0);
			const rightOk =
				right >= kinds.length
					? i === kinds.length - 1
					: kinds[right] !== 'connector' ||
						(atStart && right !== kinds.length - 1);
			if (leftOk && rightOk) {
				continue;
			}

			gone[i] = true;
			dangling.push(i);
			changed = true;
		}
	}

	return dangling;
};
