import {useState} from 'react';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

export type CanvasSelectionItem =
	| {
			readonly type: 'guide';
			readonly guideId: string;
	  }
	| {
			readonly type: 'sequence';
			readonly nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			readonly type: 'sequence-prop';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly key: string;
	  }
	| {
			readonly type: 'sequence-all-effects';
			readonly nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			readonly type: 'sequence-effect';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly i: number;
	  }
	| {
			readonly type: 'sequence-effect-prop';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly i: number;
			readonly key: string;
	  }
	| {
			readonly type: 'keyframe';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly frame: number;
	  }
	| {
			readonly type: 'easing';
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly fromFrame: number;
			readonly toFrame: number;
			readonly segmentIndex: number;
	  };

export type CanvasSelectionSnapshot = {
	readonly selectedItems: readonly CanvasSelectionItem[];
	readonly anchor: CanvasSelectionItem | null;
};

export type CanvasSelectionInteraction = {
	readonly shiftKey: boolean;
	readonly toggleKey: boolean;
};

export const EMPTY_CANVAS_SELECTION: CanvasSelectionSnapshot = {
	selectedItems: [],
	anchor: null,
};

const getCanvasNodePathInfoKey = (info: SequenceNodePathInfo): string =>
	[
		`${info.sequenceSubscriptionKey.absolutePath}:${JSON.stringify(
			info.sequenceSubscriptionKey.nodePath,
		)}:${info.sequenceSubscriptionKey.sequenceKeys.join('\0')}`,
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');

export const getCanvasSequenceSelectionKey = (
	nodePathInfo: SequenceNodePathInfo,
): string => getCanvasNodePathInfoKey({...nodePathInfo, auxiliaryKeys: []});

export const getCanvasSelectionItemKey = (
	item: CanvasSelectionItem,
): string => {
	switch (item.type) {
		case 'guide':
			return `guide.${item.guideId}`;
		case 'sequence':
			return `${getCanvasSequenceSelectionKey(item.nodePathInfo)}.sequence`;
		case 'sequence-prop':
			return `${getCanvasSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-prop.${item.key}`;
		case 'sequence-all-effects':
			return `${getCanvasSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-all-effects`;
		case 'sequence-effect':
			return `${getCanvasSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-effect.${item.i}`;
		case 'sequence-effect-prop':
			return `${getCanvasSequenceSelectionKey(
				item.nodePathInfo,
			)}.sequence-effect-prop.${item.i}.${item.key}`;
		case 'keyframe':
			return `${getCanvasNodePathInfoKey(item.nodePathInfo)}.keyframe.${
				item.frame
			}`;
		case 'easing':
			return `${getCanvasNodePathInfoKey(item.nodePathInfo)}.easing.${
				item.segmentIndex
			}`;
		default:
			throw new Error(
				`Unexpected Canvas selection type: ${item satisfies never}`,
			);
	}
};

const getCanvasSelectionType = (item: CanvasSelectionItem) => item.type;

const areCanvasSelectionTypesCompatible = (
	firstType: CanvasSelectionItem['type'],
	secondType: CanvasSelectionItem['type'],
): boolean => {
	if (firstType === secondType) {
		return true;
	}

	return (
		(firstType === 'sequence-prop' && secondType === 'sequence-effect-prop') ||
		(firstType === 'sequence-effect-prop' && secondType === 'sequence-prop') ||
		(firstType === 'keyframe' && secondType === 'easing') ||
		(firstType === 'easing' && secondType === 'keyframe')
	);
};

const isCanvasSelectionCompatibleWithType = (
	item: CanvasSelectionItem,
	type: CanvasSelectionItem['type'],
) => areCanvasSelectionTypesCompatible(getCanvasSelectionType(item), type);

const getCanvasSelectionAnchor = (
	selectedItems: readonly CanvasSelectionItem[],
	previousAnchor: CanvasSelectionItem | null,
	targetType: CanvasSelectionItem['type'],
) => {
	if (previousAnchor && getCanvasSelectionType(previousAnchor) === targetType) {
		return previousAnchor;
	}

	for (let i = selectedItems.length - 1; i >= 0; i--) {
		const candidate = selectedItems[i];
		if (getCanvasSelectionType(candidate) === targetType) {
			return candidate;
		}
	}

	return null;
};

const getCanvasRangeSelection = ({
	anchor,
	clickedItem,
	allSelectableItems,
}: {
	readonly anchor: CanvasSelectionItem;
	readonly clickedItem: CanvasSelectionItem;
	readonly allSelectableItems: readonly CanvasSelectionItem[];
}): readonly CanvasSelectionItem[] => {
	const anchorKey = getCanvasSelectionItemKey(anchor);
	const clickedKey = getCanvasSelectionItemKey(clickedItem);
	const orderedOfType = allSelectableItems.filter(
		(item) => getCanvasSelectionType(item) === clickedItem.type,
	);
	const anchorIndex = orderedOfType.findIndex(
		(item) => getCanvasSelectionItemKey(item) === anchorKey,
	);
	const clickedIndex = orderedOfType.findIndex(
		(item) => getCanvasSelectionItemKey(item) === clickedKey,
	);

	if (anchorIndex === -1 || clickedIndex === -1) {
		return [clickedItem];
	}

	const [from, to] =
		anchorIndex < clickedIndex
			? [anchorIndex, clickedIndex]
			: [clickedIndex, anchorIndex];
	return orderedOfType.slice(from, to + 1);
};

export const getCanvasSelectionAfterInteraction = ({
	currentState,
	clickedItem,
	interaction,
	allSelectableItems,
}: {
	readonly currentState: CanvasSelectionSnapshot;
	readonly clickedItem: CanvasSelectionItem;
	readonly interaction: CanvasSelectionInteraction;
	readonly allSelectableItems: readonly CanvasSelectionItem[];
}): CanvasSelectionSnapshot => {
	const {selectedItems, anchor: previousAnchor} = currentState;
	const clickedType = getCanvasSelectionType(clickedItem);
	if (clickedType === 'guide') {
		return {
			selectedItems: [clickedItem],
			anchor: clickedItem,
		};
	}

	const nextAnchor = getCanvasSelectionAnchor(
		selectedItems,
		previousAnchor,
		clickedType,
	);
	const clickedKey = getCanvasSelectionItemKey(clickedItem);

	if (interaction.shiftKey && nextAnchor) {
		return {
			selectedItems: getCanvasRangeSelection({
				anchor: nextAnchor,
				clickedItem,
				allSelectableItems,
			}),
			anchor: nextAnchor,
		};
	}

	if (interaction.toggleKey) {
		const compatibleItems = selectedItems.filter((item) =>
			isCanvasSelectionCompatibleWithType(item, clickedType),
		);
		const existingKeySet = new Set(
			compatibleItems.map(getCanvasSelectionItemKey),
		);
		if (existingKeySet.has(clickedKey)) {
			const toggledSelection = compatibleItems.filter(
				(item) => getCanvasSelectionItemKey(item) !== clickedKey,
			);
			return {
				selectedItems: toggledSelection,
				anchor: toggledSelection.length === 0 ? null : clickedItem,
			};
		}

		const selectableOrderMap = new Map(
			allSelectableItems
				.filter((item) =>
					isCanvasSelectionCompatibleWithType(item, clickedType),
				)
				.map(
					(item, index) => [getCanvasSelectionItemKey(item), index] as const,
				),
		);
		const extendedSelection = [...compatibleItems, clickedItem].sort((a, b) => {
			return (
				(selectableOrderMap.get(getCanvasSelectionItemKey(a)) ?? 0) -
				(selectableOrderMap.get(getCanvasSelectionItemKey(b)) ?? 0)
			);
		});
		return {
			selectedItems: extendedSelection,
			anchor: clickedItem,
		};
	}

	return {
		selectedItems: [clickedItem],
		anchor: clickedItem,
	};
};

export type CanvasSelectionController = {
	readonly getSnapshot: () => CanvasSelectionSnapshot;
	readonly subscribe: (listener: () => void) => () => void;
	readonly select: (
		item: CanvasSelectionItem,
		interaction: CanvasSelectionInteraction,
		allSelectableItems: readonly CanvasSelectionItem[],
	) => void;
	readonly setSelectedItems: (items: readonly CanvasSelectionItem[]) => void;
	readonly setSnapshot: (snapshot: CanvasSelectionSnapshot) => void;
	readonly clear: () => void;
};

export const createCanvasSelectionController =
	(): CanvasSelectionController => {
		let snapshot = EMPTY_CANVAS_SELECTION;
		const listeners = new Set<() => void>();

		const setSnapshot = (nextSnapshot: CanvasSelectionSnapshot) => {
			snapshot = nextSnapshot;
			for (const listener of listeners) {
				listener();
			}
		};

		return {
			getSnapshot: () => snapshot,
			subscribe: (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
			select: (item, interaction, allSelectableItems) => {
				setSnapshot(
					getCanvasSelectionAfterInteraction({
						currentState: snapshot,
						clickedItem: item,
						interaction,
						allSelectableItems,
					}),
				);
			},
			setSelectedItems: (items) => {
				setSnapshot({
					selectedItems: items,
					anchor: items.at(-1) ?? null,
				});
			},
			setSnapshot,
			clear: () => setSnapshot(EMPTY_CANVAS_SELECTION),
		};
	};

export const useCanvasSelectionController = (): CanvasSelectionController => {
	const [controller] = useState(createCanvasSelectionController);
	return controller;
};

export const useCanvasSelection = (
	controller: CanvasSelectionController,
): CanvasSelectionSnapshot => {
	return Internals.useSyncExternalStore(
		controller.subscribe,
		controller.getSnapshot,
		controller.getSnapshot,
	);
};
