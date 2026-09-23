import type {CanvasOutline} from './outline-geometry';

export type CanvasOutlineOrderTarget = {
	readonly sequence: CanvasOutlineSequenceParent;
	readonly selected: boolean;
	readonly containsSelection: boolean;
};

const outlinePointEqualityTolerance = 0.5;
const outlineAreaEqualityTolerance = 0.5;
const outlineBoundsOverlapTolerance = 0.5;

const outlinePointsAreEquivalent = (
	a: CanvasOutline['points'][number],
	b: CanvasOutline['points'][number],
) => {
	return (
		Math.abs(a.x - b.x) <= outlinePointEqualityTolerance &&
		Math.abs(a.y - b.y) <= outlinePointEqualityTolerance
	);
};

const outlinesHaveEquivalentHitArea = (
	a: CanvasOutline,
	b: CanvasOutline,
): boolean => {
	if (a.points.length !== b.points.length) {
		return false;
	}

	for (let startIndex = 0; startIndex < b.points.length; startIndex++) {
		for (const direction of [1, -1]) {
			const pointsMatch = a.points.every((point, index) => {
				const bIndex =
					(startIndex + direction * index + b.points.length) % b.points.length;
				return outlinePointsAreEquivalent(point, b.points[bIndex]);
			});

			if (pointsMatch) {
				return true;
			}
		}
	}

	return false;
};

const getOutlineHitArea = (outline: CanvasOutline): number => {
	let area = 0;

	for (let i = 0; i < outline.points.length; i++) {
		const current = outline.points[i];
		const next = outline.points[(i + 1) % outline.points.length];
		area += current.x * next.y - next.x * current.y;
	}

	return Math.abs(area) / 2;
};

const getOutlineBounds = (outline: CanvasOutline) => {
	const xs = outline.points.map((point) => point.x);
	const ys = outline.points.map((point) => point.y);

	return {
		maxX: Math.max(...xs),
		maxY: Math.max(...ys),
		minX: Math.min(...xs),
		minY: Math.min(...ys),
	};
};

const outlineBoundsOverlap = (
	aBounds: ReturnType<typeof getOutlineBounds>,
	bBounds: ReturnType<typeof getOutlineBounds>,
): boolean => {
	return (
		aBounds.minX <= bBounds.maxX + outlineBoundsOverlapTolerance &&
		aBounds.maxX + outlineBoundsOverlapTolerance >= bBounds.minX &&
		aBounds.minY <= bBounds.maxY + outlineBoundsOverlapTolerance &&
		aBounds.maxY + outlineBoundsOverlapTolerance >= bBounds.minY
	);
};

export type CanvasOutlineSequenceParent = {
	readonly id: string;
	readonly parent: string | null;
};

const getSequenceId = (target: CanvasOutlineOrderTarget | undefined) => {
	return target?.sequence?.id ?? null;
};

const getParentBySequenceId = ({
	sequences,
	targetsByKey,
}: {
	readonly sequences: readonly CanvasOutlineSequenceParent[];
	readonly targetsByKey: ReadonlyMap<string, CanvasOutlineOrderTarget>;
}) => {
	const parentBySequenceId = new Map<string, string | null>();

	for (const sequence of sequences) {
		parentBySequenceId.set(sequence.id, sequence.parent);
	}

	for (const target of targetsByKey.values()) {
		const sequenceId = getSequenceId(target);
		if (sequenceId !== null && !parentBySequenceId.has(sequenceId)) {
			parentBySequenceId.set(sequenceId, target.sequence.parent);
		}
	}

	return parentBySequenceId;
};

const isAncestorTarget = ({
	ancestor,
	descendant,
	parentBySequenceId,
}: {
	readonly ancestor: CanvasOutlineOrderTarget;
	readonly descendant: CanvasOutlineOrderTarget;
	readonly parentBySequenceId: ReadonlyMap<string, string | null>;
}): boolean => {
	const ancestorId = getSequenceId(ancestor);
	if (ancestorId === null) {
		return false;
	}

	let parentId = descendant.sequence?.parent ?? null;
	while (parentId !== null) {
		if (parentId === ancestorId) {
			return true;
		}

		parentId = parentBySequenceId.get(parentId) ?? null;
	}

	return false;
};

const orderOutlineGroup = ({
	outlines,
	parentBySequenceId,
	targetsByKey,
}: {
	readonly outlines: readonly CanvasOutline[];
	readonly parentBySequenceId: ReadonlyMap<string, string | null>;
	readonly targetsByKey: ReadonlyMap<string, CanvasOutlineOrderTarget>;
}): readonly CanvasOutline[] => {
	const incomingEdges = new Map<string, Set<string>>();
	const outgoingEdges = new Map<string, Set<string>>();
	const outlinesByKey = new Map(
		outlines.map((outline) => [outline.key, outline]),
	);

	for (const outline of outlines) {
		incomingEdges.set(outline.key, new Set());
		outgoingEdges.set(outline.key, new Set());
	}

	const hasPath = ({
		fromKey,
		seen,
		toKey,
	}: {
		readonly fromKey: string;
		readonly seen: Set<string>;
		readonly toKey: string;
	}): boolean => {
		if (fromKey === toKey) {
			return true;
		}

		if (seen.has(fromKey)) {
			return false;
		}

		seen.add(fromKey);
		for (const nextKey of outgoingEdges.get(fromKey) ?? []) {
			if (hasPath({fromKey: nextKey, seen, toKey})) {
				return true;
			}
		}

		return false;
	};

	const addEdge = (
		before: CanvasOutline,
		after: CanvasOutline,
		options: {readonly skipIfCycle: boolean} | null,
	) => {
		if (before.key === after.key) {
			return;
		}

		const incoming = incomingEdges.get(after.key);
		const outgoing = outgoingEdges.get(before.key);
		if (incoming === undefined || outgoing === undefined) {
			throw new Error('Expected outline to be registered before adding edge');
		}

		if (outgoing.has(after.key)) {
			return;
		}

		if (hasPath({fromKey: after.key, seen: new Set(), toKey: before.key})) {
			if (options?.skipIfCycle) {
				return;
			}

			throw new Error('Could not determine a stable outline rendering order');
		}

		incoming.add(before.key);
		outgoing.add(after.key);
	};

	const addAncestorConstraint = ({
		ancestor,
		descendant,
		descendantContainsSelection,
		equivalentHitArea,
	}: {
		readonly ancestor: CanvasOutline;
		readonly descendant: CanvasOutline;
		readonly descendantContainsSelection: boolean;
		readonly equivalentHitArea: boolean;
	}) => {
		// Usually, children should be above parents so nested elements are directly
		// selectable. If an unselected child has the same hit area as its parent, put
		// it below the parent so the wrapper can be selected. Once the child or
		// one of its properties is selected, keep it above the parent so it remains
		// directly draggable.
		if (equivalentHitArea && !descendantContainsSelection) {
			addEdge(descendant, ancestor, null);
		} else {
			addEdge(ancestor, descendant, null);
		}
	};

	const outlineBySequenceId = new Map<string, CanvasOutline>();
	for (const outline of outlines) {
		const sequenceId = getSequenceId(targetsByKey.get(outline.key));
		if (sequenceId !== null) {
			outlineBySequenceId.set(sequenceId, outline);
		}
	}

	// Only constrain each outline against its nearest rendered ancestor. The
	// resulting graph follows the sequence tree, so pairwise subpixel equivalence
	// cannot introduce contradictory edges across three nested outlines.
	for (const descendant of outlines) {
		const descendantTarget = targetsByKey.get(descendant.key);
		let parentId = descendantTarget?.sequence?.parent ?? null;

		while (parentId !== null) {
			const ancestor = outlineBySequenceId.get(parentId);
			if (ancestor !== undefined) {
				addAncestorConstraint({
					ancestor,
					descendant,
					descendantContainsSelection:
						(descendantTarget?.selected ?? false) ||
						(descendantTarget?.containsSelection ?? false),
					equivalentHitArea: outlinesHaveEquivalentHitArea(
						ancestor,
						descendant,
					),
				});
				break;
			}

			parentId = parentBySequenceId.get(parentId) ?? null;
		}
	}

	// For unrelated overlapping outlines, put broader hit targets below
	// smaller ones so a large selected sequence cannot swallow clicks on
	// a more specific element in the same canvas area.
	const bounds = outlines.map(getOutlineBounds);
	const areas = outlines.map(getOutlineHitArea);
	for (let i = 0; i < outlines.length; i++) {
		const a = outlines[i];
		const aTarget = targetsByKey.get(a.key);
		if (aTarget === undefined) {
			continue;
		}

		for (let j = i + 1; j < outlines.length; j++) {
			if (!outlineBoundsOverlap(bounds[i], bounds[j])) {
				continue;
			}

			const aArea = areas[i];
			const bArea = areas[j];
			if (Math.abs(aArea - bArea) <= outlineAreaEqualityTolerance) {
				continue;
			}

			const b = outlines[j];
			const bTarget = targetsByKey.get(b.key);
			if (bTarget === undefined) {
				continue;
			}

			const aAncestorOfB = isAncestorTarget({
				ancestor: aTarget,
				descendant: bTarget,
				parentBySequenceId,
			});
			const bAncestorOfA = isAncestorTarget({
				ancestor: bTarget,
				descendant: aTarget,
				parentBySequenceId,
			});

			if (aAncestorOfB || bAncestorOfA) {
				continue;
			}

			if (aArea > bArea) {
				addEdge(a, b, {skipIfCycle: true});
			} else {
				addEdge(b, a, {skipIfCycle: true});
			}
		}
	}

	const emitted = new Set<string>();
	const visiting = new Set<string>();
	const ordered: CanvasOutline[] = [];

	const visit = (outline: CanvasOutline) => {
		if (emitted.has(outline.key)) {
			return;
		}

		if (visiting.has(outline.key)) {
			throw new Error('Could not determine a stable outline rendering order');
		}

		visiting.add(outline.key);
		for (const dependencyKey of incomingEdges.get(outline.key) ?? []) {
			const dependency = outlinesByKey.get(dependencyKey);
			if (dependency === undefined) {
				throw new Error('Expected outline dependency to exist');
			}

			visit(dependency);
		}

		visiting.delete(outline.key);
		emitted.add(outline.key);
		ordered.push(outline);
	};

	for (const outline of outlines) {
		visit(outline);
	}

	return ordered;
};

/** Orders quads from back to front while preserving access to nested targets. */
export const orderCanvasOutlinesForRendering = ({
	outlines,
	sequences,
	targetsByKey,
}: {
	readonly outlines: readonly CanvasOutline[];
	readonly sequences: readonly CanvasOutlineSequenceParent[];
	readonly targetsByKey: ReadonlyMap<string, CanvasOutlineOrderTarget>;
}): readonly CanvasOutline[] => {
	const parentBySequenceId = getParentBySequenceId({sequences, targetsByKey});

	return orderOutlineGroup({
		outlines,
		parentBySequenceId,
		targetsByKey,
	});
};
