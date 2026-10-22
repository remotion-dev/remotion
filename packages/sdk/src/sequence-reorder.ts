import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {getCanvasSelectionItemKey, type CanvasSelectionItem} from './selection';

/** The sequences to move when a timeline drag starts on a sequence. */
export const getCanvasSequenceReorderSelection = ({
	draggedItem,
	selectedItems,
}: {
	readonly draggedItem: Extract<CanvasSelectionItem, {type: 'sequence'}>;
	readonly selectedItems: readonly CanvasSelectionItem[];
}): readonly SequenceNodePathInfo[] => {
	const draggedKey = getCanvasSelectionItemKey(draggedItem);
	if (
		selectedItems.length < 2 ||
		selectedItems.some((item) => item.type !== 'sequence') ||
		!selectedItems.some(
			(item) => getCanvasSelectionItemKey(item) === draggedKey,
		)
	) {
		return [draggedItem.nodePathInfo];
	}

	return selectedItems.flatMap((item) =>
		item.type === 'sequence' ? [item.nodePathInfo] : [],
	);
};

/** The insertion index after the selected siblings have been removed. */
export const getCanvasSequenceReorderInsertionIndex = ({
	sourceIndexes,
	targetIndex,
	position,
}: {
	readonly sourceIndexes: readonly number[];
	readonly targetIndex: number;
	readonly position: 'before' | 'after';
}): number | null => {
	if (
		sourceIndexes.length === 0 ||
		targetIndex < 0 ||
		sourceIndexes.some((index) => index < 0) ||
		sourceIndexes.includes(targetIndex) ||
		new Set(sourceIndexes).size !== sourceIndexes.length
	) {
		return null;
	}

	const sorted = [...sourceIndexes].sort((a, b) => a - b);
	const rawIndex = targetIndex + (position === 'after' ? 1 : 0);
	const insertionIndex =
		rawIndex - sorted.filter((index) => index < rawIndex).length;
	if (
		sorted.every((index, offset) => index === sorted[0] + offset) &&
		insertionIndex === sorted[0]
	) {
		return null;
	}

	return insertionIndex;
};
