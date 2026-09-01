import {
	EMPTY_CANVAS_SELECTION,
	getCanvasSelectionAfterInteraction,
	getCanvasSelectionItemKey,
	getCanvasSequenceSelectionKey,
	useCanvasSelection,
	useCanvasSelectionController,
	type CanvasSelectionInteraction,
	type CanvasSelectionItem,
	type CanvasSelectionSnapshot,
} from '@remotion/canvas';
import {
	canEditEasingForInterpolationFunction,
	stringifySequenceExpandedRowKey,
} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from 'react';
import {
	Internals,
	type GetDragOverrides,
	type GetEffectDragOverrides,
	type PropStatuses,
} from 'remotion';
import {canUseKeyframeOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BACKGROUND,
	BLACK,
	TIMELINE_BACKGROUND_COLOR,
	TIMELINE_SELECTED_BACKGROUND_COLOR,
	TIMELINE_SELECTED_LABEL_BACKGROUND_COLOR,
	WHITE_ALPHA_05,
	WHITE_ALPHA_10,
	WHITE_ALPHA_80,
} from '../../helpers/colors';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {
	isStudioInteractivityEnabled,
	isStudioSelectionEnabled,
} from '../../helpers/interactivity-enabled';
import {startCapturedPointerSession} from '../../helpers/pointer-session';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	TIMELINE_PADDING,
	type TimelineTreeNode,
} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {useKeybinding} from '../../helpers/use-keybinding';
import {useZIndex} from '../../state/z-index';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
	type GetIsExpanded,
} from '../ExpandedTracksProvider';
import {selectOptionsSidebarInspectorPanel} from '../options-sidebar-tabs';
import {getNodeHasKeyframes, getNodeKeyframes} from './get-node-keyframes';
import {getTimelineEasingSegments} from './get-timeline-easing-segments';
import {getCurrentFrame} from './imperative-state';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import {
	filterTimelineExpandedTree,
	getSelectedTimelineExpandedRowKeys,
	isTimelineExpandedNodeSelected,
} from './timeline-expanded-filter';
import {scrollableRef, timelineVerticalScroll} from './timeline-refs';
import {
	EDGE_SCROLL_VERTICAL_INCREMENT,
	SCROLL_INCREMENT,
	startTimelineEdgeAutoScroll,
} from './timeline-scroll-logic';
import {TimelineClipboardKeybindings} from './TimelineClipboardKeybindings';
import {TimelineDeleteKeybindings} from './TimelineDeleteKeybindings';

export const TIMELINE_SELECTED_BACKGROUND = TIMELINE_SELECTED_BACKGROUND_COLOR;
export const TIMELINE_EXPANDED_SELECTED_BACKGROUND = BACKGROUND;
export const TIMELINE_HOVER_BACKGROUND = WHITE_ALPHA_05;
export const TIMELINE_SELECTED_LABEL_BACKGROUND =
	TIMELINE_SELECTED_LABEL_BACKGROUND_COLOR;
export const TIMELINE_SELECTED_LABEL_TEXT = BLACK;
export const TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING = 2;

export const getTimelineSelectedLabelStyle = (
	selected: boolean,
	subcategory: boolean,
): CSSProperties => {
	return {
		paddingLeft: TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING,
		paddingRight: TIMELINE_SELECTED_LABEL_HORIZONTAL_PADDING,
		...(selected
			? {
					backgroundColor: subcategory
						? WHITE_ALPHA_10
						: TIMELINE_SELECTED_LABEL_BACKGROUND,
				}
			: {}),
	};
};

export const getTimelineColor = (selected: boolean, subcategory: boolean) => {
	return selected && !subcategory
		? TIMELINE_SELECTED_LABEL_TEXT
		: WHITE_ALPHA_80;
};

export const getTimelineSelectedTrackHighlightStyle = (
	timelineWidth: number,
	backgroundColor: string = TIMELINE_SELECTED_BACKGROUND,
): CSSProperties => ({
	backgroundColor,
	bottom: 0,
	left: -TIMELINE_PADDING,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: timelineWidth,
});

export const getTimelineRowHighlightBackground = ({
	showSelectedBackground,
	selected,
	containsSelection,
	hovered,
	selectedBackground,
}: {
	readonly showSelectedBackground: boolean;
	readonly selected: boolean;
	readonly containsSelection: boolean;
	readonly hovered: boolean;
	readonly selectedBackground: string;
}): string | undefined => {
	if (showSelectedBackground && (selected || containsSelection)) {
		return selectedBackground;
	}

	return hovered ? TIMELINE_HOVER_BACKGROUND : undefined;
};

export const TIMELINE_BACKGROUND = TIMELINE_BACKGROUND_COLOR;
export const TIMELINE_TICKS_BACKGROUND = BACKGROUND;

export type TimelineSelection = CanvasSelectionItem;

export type TimelineEasingSelection = Extract<
	TimelineSelection,
	{type: 'easing'}
>;

export type TimelineSelectionInteraction = CanvasSelectionInteraction;

export const isTimelineSelectionModifierEvent = ({
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}) => {
	return shiftKey || metaKey || ctrlKey;
};

export const shouldSelectTimelineRowOnPointerDown = ({
	selected,
	shiftKey,
	metaKey,
	ctrlKey,
}: {
	readonly selected: boolean;
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly ctrlKey: boolean;
}) => {
	return (
		!selected || isTimelineSelectionModifierEvent({shiftKey, metaKey, ctrlKey})
	);
};

export type TimelineSelectionState = CanvasSelectionSnapshot;

export const EMPTY_TIMELINE_SELECTION_STATE: TimelineSelectionState =
	EMPTY_CANVAS_SELECTION;

export type TimelineMarqueeRect = {
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
};

export type TimelineMarqueeSelectionKind = 'sequence' | 'keyframes-and-easings';

export type TimelineMarqueeSelectionCandidate = {
	readonly item: TimelineSelection;
	readonly rect: TimelineMarqueeRect;
};

export const getTimelineSelectionAfterInteraction =
	getCanvasSelectionAfterInteraction;

export const getAvailableTimelineSelectionState = ({
	availableKeys,
	availableItemsByKey,
	state,
}: {
	readonly availableKeys: ReadonlySet<string>;
	readonly availableItemsByKey?: ReadonlyMap<string, TimelineSelection>;
	readonly state: TimelineSelectionState;
}): TimelineSelectionState => {
	if (state.selectedItems.length === 0 && state.anchor === null) {
		return state;
	}

	const getCurrentSelectionItem = (item: TimelineSelection) => {
		const key = getTimelineSelectionKey(item);
		if (!availableKeys.has(key)) {
			return null;
		}

		return availableItemsByKey?.get(key) ?? item;
	};

	const selectedItems = state.selectedItems
		.map(getCurrentSelectionItem)
		.filter((item): item is TimelineSelection => item !== null);
	const anchor = state.anchor ? getCurrentSelectionItem(state.anchor) : null;

	if (
		selectedItems.length === state.selectedItems.length &&
		anchor === state.anchor
	) {
		return state;
	}

	return {
		selectedItems,
		anchor,
	};
};

export const getNormalizedTimelineMarqueeRect = ({
	startX,
	startY,
	currentX,
	currentY,
}: {
	readonly startX: number;
	readonly startY: number;
	readonly currentX: number;
	readonly currentY: number;
}): TimelineMarqueeRect => ({
	left: Math.min(startX, currentX),
	top: Math.min(startY, currentY),
	right: Math.max(startX, currentX),
	bottom: Math.max(startY, currentY),
});

export const getClampedTimelineMarqueePoint = ({
	x,
	y,
	bounds,
}: {
	readonly x: number;
	readonly y: number;
	readonly bounds: TimelineMarqueeRect;
}): {
	readonly x: number;
	readonly y: number;
} => ({
	x: Math.min(bounds.right, Math.max(bounds.left, x)),
	y: Math.min(bounds.bottom, Math.max(bounds.top, y)),
});

export const timelineMarqueeRectsIntersect = (
	a: TimelineMarqueeRect,
	b: TimelineMarqueeRect,
) =>
	a.left <= b.right &&
	a.right >= b.left &&
	a.top <= b.bottom &&
	a.bottom >= b.top;

const getTimelineMarqueeSelectionKind = (
	item: TimelineSelection,
): TimelineMarqueeSelectionKind | null => {
	if (item.type === 'sequence') {
		return 'sequence';
	}

	if (item.type === 'keyframe' || item.type === 'easing') {
		return 'keyframes-and-easings';
	}

	return null;
};

const isTimelineSelectionCompatibleWithMarqueeKind = (
	item: TimelineSelection,
	kind: TimelineMarqueeSelectionKind,
) => {
	if (kind === 'sequence') {
		return item.type === 'sequence';
	}

	return item.type === 'keyframe' || item.type === 'easing';
};

export const getTimelineMarqueeSelection = ({
	candidates,
	lockedSelectionKind,
	marqueeRect,
}: {
	readonly candidates: readonly TimelineMarqueeSelectionCandidate[];
	readonly lockedSelectionKind: TimelineMarqueeSelectionKind | null;
	readonly marqueeRect: TimelineMarqueeRect;
}): {
	readonly lockedSelectionKind: TimelineMarqueeSelectionKind | null;
	readonly selectedItems: readonly TimelineSelection[];
} => {
	const geometricallyIntersectingCandidates = candidates.filter((candidate) => {
		return (
			getTimelineMarqueeSelectionKind(candidate.item) !== null &&
			timelineMarqueeRectsIntersect(candidate.rect, marqueeRect)
		);
	});
	const intersectingKeyframes = new Set(
		geometricallyIntersectingCandidates.flatMap((candidate) => {
			if (candidate.item.type !== 'keyframe') {
				return [];
			}

			return [
				`${timelineNodePathInfoToKey(candidate.item.nodePathInfo)}.${candidate.item.frame}`,
			];
		}),
	);
	const intersectingCandidates = geometricallyIntersectingCandidates.filter(
		(candidate) => {
			if (candidate.item.type !== 'easing') {
				return true;
			}

			const fieldKey = timelineNodePathInfoToKey(candidate.item.nodePathInfo);
			return (
				intersectingKeyframes.has(`${fieldKey}.${candidate.item.fromFrame}`) &&
				intersectingKeyframes.has(`${fieldKey}.${candidate.item.toFrame}`)
			);
		},
	);
	const getFirstIntersectingSelectionKind = () =>
		intersectingCandidates.length === 0
			? null
			: getTimelineMarqueeSelectionKind(intersectingCandidates[0].item);
	let nextLockedSelectionKind =
		lockedSelectionKind ?? getFirstIntersectingSelectionKind();
	const getSelectedItemsForKind = (kind: TimelineMarqueeSelectionKind) =>
		intersectingCandidates
			.filter((candidate) =>
				isTimelineSelectionCompatibleWithMarqueeKind(candidate.item, kind),
			)
			.map((candidate) => candidate.item);

	if (nextLockedSelectionKind === null) {
		return {lockedSelectionKind: null, selectedItems: []};
	}

	let selectedItems = getSelectedItemsForKind(nextLockedSelectionKind);
	if (lockedSelectionKind !== null && selectedItems.length === 0) {
		nextLockedSelectionKind = getFirstIntersectingSelectionKind();
		selectedItems =
			nextLockedSelectionKind === null
				? []
				: getSelectedItemsForKind(nextLockedSelectionKind);
	}

	return {
		lockedSelectionKind: nextLockedSelectionKind,
		selectedItems,
	};
};

export const extendTimelineMarqueeSelection = ({
	currentSelection,
	marqueeSelection,
}: {
	readonly currentSelection: readonly TimelineSelection[];
	readonly marqueeSelection: readonly TimelineSelection[];
}): readonly TimelineSelection[] => {
	if (marqueeSelection.length === 0) {
		return currentSelection;
	}

	const marqueeKind = getTimelineMarqueeSelectionKind(marqueeSelection[0]);
	if (marqueeKind === null) {
		return marqueeSelection;
	}

	const selectedKeys = new Set(
		currentSelection.map((item) => getTimelineSelectionKey(item)),
	);
	return [
		...currentSelection.filter((item) =>
			isTimelineSelectionCompatibleWithMarqueeKind(item, marqueeKind),
		),
		...marqueeSelection.filter((item) => {
			const key = getTimelineSelectionKey(item);
			if (selectedKeys.has(key)) {
				return false;
			}

			selectedKeys.add(key);
			return true;
		}),
	];
};

type TimelineSelectionContextValue = {
	readonly canSelect: boolean;
	readonly revealRequest: TimelineSelectionRevealRequest | null;
	readonly selectedItems: readonly TimelineSelection[];
	readonly isSelected: (item: TimelineSelection) => boolean;
	readonly selectItem: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
		allSelectableItems?: readonly TimelineSelection[],
		options?: TimelineSelectionOptions,
	) => void;
	readonly selectItems: (
		items: readonly TimelineSelection[],
		options?: TimelineSelectionOptions,
	) => void;
	readonly registerMarqueeSelectableItem: (
		item: TimelineSelection,
		getRect: () => DOMRect | null,
	) => () => void;
	readonly getMarqueeSelection: (
		marqueeRect: TimelineMarqueeRect,
		lockedSelectionKind: TimelineMarqueeSelectionKind | null,
	) => {
		readonly lockedSelectionKind: TimelineMarqueeSelectionKind | null;
		readonly selectedItems: readonly TimelineSelection[];
	};
	readonly containsSelection: (nodePathInfo: SequenceNodePathInfo) => boolean;
	readonly clearSelection: () => void;
};

const defaultTimelineSelectionContextValue: TimelineSelectionContextValue = {
	canSelect: false,
	revealRequest: null,
	selectedItems: [],
	isSelected: () => false,
	selectItem: () => undefined,
	selectItems: () => undefined,
	registerMarqueeSelectableItem: () => () => undefined,
	getMarqueeSelection: () => ({
		lockedSelectionKind: null,
		selectedItems: [],
	}),
	containsSelection: () => false,
	clearSelection: () => undefined,
};

const TimelineSelectionContext = createContext<TimelineSelectionContextValue>(
	defaultTimelineSelectionContextValue,
);

const EMPTY_SELECTABLE_TIMELINE_ITEMS: readonly TimelineSelection[] = [];

const SelectableTimelineItemsContext = createContext<
	React.RefObject<readonly TimelineSelection[]>
>({current: EMPTY_SELECTABLE_TIMELINE_ITEMS});

export const TimelineSelectionOrderProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly items: readonly TimelineSelection[];
}> = ({children, items}) => {
	const itemsRef = useRef(items);
	itemsRef.current = items;

	return (
		<SelectableTimelineItemsContext.Provider value={itemsRef}>
			{children}
		</SelectableTimelineItemsContext.Provider>
	);
};

const CurrentTimelineSelectionContext =
	createContext<React.RefObject<TimelineSelectionContextValue> | null>(null);

type TimelineSelectionOptions = {
	readonly reveal?: boolean;
};

type TimelineSelectionRevealRequest = {
	readonly item: TimelineSelection;
	readonly token: number;
};

const parseEffectIndex = (effectIndex: string): number | null => {
	const parsed = Number(effectIndex);
	if (!Number.isInteger(parsed) || parsed < 0) {
		return null;
	}

	return parsed;
};

export const getTimelineSelectionFromNodePathInfo = (
	nodePathInfo: SequenceNodePathInfo | null,
): TimelineSelection | null => {
	if (nodePathInfo === null) {
		return null;
	}

	const {auxiliaryKeys} = nodePathInfo;
	if (auxiliaryKeys.length === 0) {
		return {type: 'sequence', nodePathInfo};
	}

	if (auxiliaryKeys.length === 2 && auxiliaryKeys[0] === 'controls') {
		return {type: 'sequence-prop', nodePathInfo, key: auxiliaryKeys[1]};
	}

	if (auxiliaryKeys.length === 1 && auxiliaryKeys[0] === 'effects') {
		return {type: 'sequence-all-effects', nodePathInfo};
	}

	if (auxiliaryKeys[0] === 'effects') {
		const effectIndex = parseEffectIndex(auxiliaryKeys[1]);
		if (effectIndex === null) {
			return null;
		}

		if (auxiliaryKeys.length === 2) {
			return {type: 'sequence-effect', nodePathInfo, i: effectIndex};
		}

		if (auxiliaryKeys.length === 3) {
			return {
				type: 'sequence-effect-prop',
				nodePathInfo,
				i: effectIndex,
				key: auxiliaryKeys[2],
			};
		}
	}

	return null;
};

export const getTimelineSelectionKey = getCanvasSelectionItemKey;

const nodePathDescendsFrom = (
	descendant: SequenceNodePathInfo,
	ancestor: SequenceNodePathInfo,
): boolean => {
	if (
		stringifySequenceExpandedRowKey(descendant.sequenceSubscriptionKey) !==
		stringifySequenceExpandedRowKey(ancestor.sequenceSubscriptionKey)
	) {
		return false;
	}

	if (descendant.index !== ancestor.index) {
		return false;
	}

	// Must be strictly deeper than `ancestor` (i.e. a descendant), not the same row.
	if (descendant.auxiliaryKeys.length <= ancestor.auxiliaryKeys.length) {
		return false;
	}

	return ancestor.auxiliaryKeys.every(
		(key, i) => descendant.auxiliaryKeys[i] === key,
	);
};

export const getSelectableTimelineSequenceSelections = (
	tracks: readonly Pick<TimelineTrackData, 'nodePathInfo'>[],
): TimelineSelection[] => {
	return tracks.flatMap((track): TimelineSelection[] => {
		if (
			track.nodePathInfo === null ||
			track.nodePathInfo.auxiliaryKeys.length > 0
		) {
			return [];
		}

		return [{type: 'sequence', nodePathInfo: track.nodePathInfo}];
	});
};

const getTimelineTreeNodeCanEditEasing = ({
	node,
	nodePathInfo,
	propStatuses,
}: {
	readonly node: TimelineTreeNode;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly propStatuses: PropStatuses;
}) => {
	if (node.kind !== 'field' || node.field === null) {
		return false;
	}

	if (node.field.kind === 'sequence-field') {
		const sequencePropStatus = Internals.getPropStatusesCtx(
			propStatuses,
			nodePathInfo.sequenceSubscriptionKey,
		)?.[node.field.key];
		return (
			sequencePropStatus?.status === 'keyframed' &&
			canEditEasingForInterpolationFunction(
				sequencePropStatus.interpolationFunction,
			)
		);
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath: nodePathInfo.sequenceSubscriptionKey,
		effectIndex: node.field.effectIndex,
	});
	const effectPropStatus =
		effectStatus.type === 'can-update-effect'
			? effectStatus.props[node.field.key]
			: null;
	return (
		effectPropStatus?.status === 'keyframed' &&
		canEditEasingForInterpolationFunction(
			effectPropStatus.interpolationFunction,
		)
	);
};

export const getSelectableTimelineItems = ({
	getDragOverrides,
	getEffectDragOverrides,
	getIsExpanded,
	propStatuses,
	selectedItems,
	timeline,
	timelinePosition,
}: {
	readonly getDragOverrides: GetDragOverrides;
	readonly getEffectDragOverrides: GetEffectDragOverrides;
	readonly getIsExpanded: GetIsExpanded;
	readonly propStatuses: PropStatuses;
	readonly selectedItems: readonly TimelineSelection[];
	readonly timeline: readonly TimelineTrackData[];
	readonly timelinePosition: number;
}): TimelineSelection[] => {
	const selectedRowKeys = getSelectedTimelineExpandedRowKeys(selectedItems);

	return timeline.flatMap((track): TimelineSelection[] => {
		const {nodePathInfo} = track;
		if (nodePathInfo === null) {
			return [];
		}

		const sequenceSelection =
			getTimelineSelectionFromNodePathInfo(nodePathInfo);
		if (sequenceSelection === null) {
			return [];
		}

		if (!getIsExpanded(nodePathInfo)) {
			return [sequenceSelection];
		}

		const tree = buildTimelineTree({
			sequence: track.sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			propStatuses,
			includeTextContent: false,
			includeSourceControls: false,
			runtimeValues: null,
		});
		const filteredTree = filterTimelineExpandedTree({
			nodes: tree,
			shouldShowNode: (node) =>
				isTimelineExpandedNodeSelected({
					nodePathInfo: node.nodePathInfo,
					selectedRowKeys,
				}) ||
				getNodeHasKeyframes({
					node,
					nodePath: nodePathInfo.sequenceSubscriptionKey,
					propStatuses,
					getDragOverrides,
					getEffectDragOverrides,
				}),
		});
		const visibleTreeRows = flattenVisibleTreeNodes({
			nodes: filteredTree,
			getIsExpanded,
		});

		return [
			sequenceSelection,
			...visibleTreeRows.flatMap(({node}): TimelineSelection[] => {
				const rowSelection = getTimelineSelectionFromNodePathInfo(
					node.nodePathInfo,
				);
				if (rowSelection === null) {
					return [];
				}

				const keyframes = getNodeKeyframes({
					node,
					nodePath: nodePathInfo.sequenceSubscriptionKey,
					propStatuses,
					keyframeDisplayOffset: track.keyframeDisplayOffset,
					getDragOverrides,
					getEffectDragOverrides,
					timelinePosition,
				});
				const keyframeSelections = keyframes.map(
					(keyframe): TimelineSelection => ({
						type: 'keyframe',
						nodePathInfo: node.nodePathInfo,
						frame: keyframe.frame,
					}),
				);
				const easingSelections = getTimelineTreeNodeCanEditEasing({
					node,
					nodePathInfo,
					propStatuses,
				})
					? getTimelineEasingSegments(keyframes).map(
							(segment): TimelineSelection => ({
								type: 'easing',
								nodePathInfo: node.nodePathInfo,
								fromFrame: segment.fromFrame,
								toFrame: segment.toFrame,
								segmentIndex: segment.segmentIndex,
							}),
						)
					: [];

				return [rowSelection, ...easingSelections, ...keyframeSelections];
			}),
		];
	});
};

export const getTimelineSequenceSelectionKey = getCanvasSequenceSelectionKey;

export const TimelineSelectAllKeybindings: React.FC<{
	readonly timeline: readonly TimelineTrackData[];
}> = ({timeline}) => {
	const keybindings = useKeybinding();
	const {canSelect} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	const selectableSequenceSelections = useMemo(
		() => getSelectableTimelineSequenceSelections(timeline),
		[timeline],
	);
	const selectableSequenceSelectionsRef = useRef(selectableSequenceSelections);
	selectableSequenceSelectionsRef.current = selectableSequenceSelections;

	useEffect(() => {
		if (!canSelect) {
			return;
		}

		const selectAll = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'a',
			callback: () => {
				const latestSelectableSequenceSelections =
					selectableSequenceSelectionsRef.current;
				if (latestSelectableSequenceSelections.length === 0) {
					return;
				}

				currentSelection.current.selectItems(
					latestSelectableSequenceSelections,
				);
			},
			commandCtrlKey: true,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			selectAll.unregister();
		};
	}, [canSelect, currentSelection, keybindings]);

	return null;
};

const fieldsSelectingSequenceOnEscape = new Set([
	'cropLeft',
	'cropRight',
	'cropTop',
	'cropBottom',
	'style.rotate',
]);

export const getTimelineSequenceSelectionForEscape = (
	selectedItems: readonly TimelineSelection[],
): Extract<TimelineSelection, {type: 'sequence'}> | null => {
	if (selectedItems.length !== 1) {
		return null;
	}

	const [selectedItem] = selectedItems;
	let fieldKey: string | null = null;
	if (selectedItem.type === 'sequence-prop') {
		fieldKey = selectedItem.key;
	} else if (
		selectedItem.type === 'keyframe' ||
		selectedItem.type === 'easing'
	) {
		const field = parseKeyframeFieldFromNodePath(
			selectedItem.nodePathInfo.auxiliaryKeys,
		);
		fieldKey = field?.type === 'sequence' ? field.fieldKey : null;
	} else {
		return null;
	}

	if (!fieldsSelectingSequenceOnEscape.has(fieldKey ?? '')) {
		return null;
	}

	return {
		type: 'sequence',
		nodePathInfo: {
			...selectedItem.nodePathInfo,
			auxiliaryKeys: [],
		},
	};
};

const TimelineEscapeKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	useEffect(() => {
		const escape = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'Escape',
			callback: (event) => {
				const {selectedItems, clearSelection, selectItems} =
					currentSelection.current;
				if (selectedItems.length === 0) {
					return;
				}

				const sequenceSelection =
					getTimelineSequenceSelectionForEscape(selectedItems);
				if (sequenceSelection) {
					selectItems([sequenceSelection]);
					event.preventDefault();
					return;
				}

				clearSelection();
				event.preventDefault();
			},
			commandCtrlKey: false,
			preventDefault: false,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			escape.unregister();
		};
	}, [currentSelection, keybindings]);

	return null;
};

export const TimelineSelectableItemsProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly timeline: readonly TimelineTrackData[];
}> = ({children, timeline}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {selectedItems} = useTimelineSelection();
	const selectableItems = useMemo(
		() =>
			getSelectableTimelineItems({
				getDragOverrides,
				getEffectDragOverrides,
				getIsExpanded,
				propStatuses,
				selectedItems,
				timeline,
				timelinePosition: getCurrentFrame(),
			}),
		[
			getDragOverrides,
			getEffectDragOverrides,
			getIsExpanded,
			propStatuses,
			selectedItems,
			timeline,
		],
	);

	return (
		<TimelineSelectionOrderProvider items={selectableItems}>
			{children}
		</TimelineSelectionOrderProvider>
	);
};

export const TimelineSelectionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const timelineSelectionScope =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const {expandParentTracks} = useContext(ExpandedTracksSetterContext);
	const canSelect =
		isStudioSelectionEnabled() &&
		(previewServerState.type === 'connected' ||
			window.remotion_isReadOnlyStudio);
	const keyframeOperationsAvailable = canUseKeyframeOperations();
	const selectionController = useCanvasSelectionController();
	const selectionState = useCanvasSelection(selectionController);
	const selectionScope = useRef<string | null>(null);
	const marqueeSelectableItems = useRef(
		new Map<
			string,
			{
				readonly getRect: () => DOMRect | null;
				readonly item: TimelineSelection;
				readonly order: number;
			}
		>(),
	);
	const marqueeRegistrationCounter = useRef(0);
	const [revealRequest, setRevealRequest] =
		useState<TimelineSelectionRevealRequest | null>(null);

	useEffect(() => {
		if (!canSelect) {
			selectionScope.current = null;
			setRevealRequest(null);
			selectionController.clear();
		}
	}, [canSelect, selectionController]);

	const canSelectItem = useCallback(
		(item: TimelineSelection) =>
			canSelect &&
			(!window.remotion_isReadOnlyStudio ||
				keyframeOperationsAvailable ||
				item.type === 'sequence'),
		[canSelect, keyframeOperationsAvailable],
	);

	const availableSelectionState =
		selectionScope.current === timelineSelectionScope
			? selectionState
			: EMPTY_TIMELINE_SELECTION_STATE;
	const availableSelectedItems = availableSelectionState.selectedItems;

	const requestRevealSelectionItem = useCallback((item: TimelineSelection) => {
		setRevealRequest((previousRequest) => ({
			item,
			token: (previousRequest?.token ?? 0) + 1,
		}));
	}, []);

	const expandParentsForSelectionItems = useCallback(
		(items: readonly TimelineSelection[]) => {
			for (const item of items) {
				if (item.type === 'guide') {
					continue;
				}

				expandParentTracks(item.nodePathInfo);
			}
		},
		[expandParentTracks],
	);

	const expandParentsForSelectionItem = useCallback(
		(item: TimelineSelection) => {
			if (item.type === 'guide') {
				return;
			}

			expandParentTracks(item.nodePathInfo);
		},
		[expandParentTracks],
	);

	useEffect(() => {
		if (selectionScope.current === timelineSelectionScope) {
			return;
		}

		selectionScope.current = timelineSelectionScope;
		selectionController.clear();
	}, [selectionController, timelineSelectionScope]);

	const selectedKeys = useMemo(
		() => new Set(availableSelectedItems.map(getTimelineSelectionKey)),
		[availableSelectedItems],
	);

	const isSelected = useCallback(
		(item: TimelineSelection) => {
			return selectedKeys.has(getTimelineSelectionKey(item));
		},
		[selectedKeys],
	);

	const selectItem = useCallback(
		(
			item: TimelineSelection,
			interaction: TimelineSelectionInteraction = {
				shiftKey: false,
				toggleKey: false,
			},
			allSelectableItems: readonly TimelineSelection[] = [],
			options: TimelineSelectionOptions = {},
		) => {
			if (!canSelectItem(item)) {
				return;
			}

			selectOptionsSidebarInspectorPanel();
			expandParentsForSelectionItem(item);
			if (options.reveal) {
				requestRevealSelectionItem(item);
			}

			if (selectionScope.current !== timelineSelectionScope) {
				selectionController.clear();
			}

			selectionScope.current = timelineSelectionScope;
			selectionController.select(item, interaction, allSelectableItems);
		},
		[
			canSelectItem,
			expandParentsForSelectionItem,
			requestRevealSelectionItem,
			selectionController,
			timelineSelectionScope,
		],
	);

	const selectItems = useCallback(
		(
			items: readonly TimelineSelection[],
			options: TimelineSelectionOptions = {},
		) => {
			if (!items.every(canSelectItem)) {
				return;
			}

			if (items.length > 0) {
				selectOptionsSidebarInspectorPanel();
			}

			selectionScope.current = timelineSelectionScope;
			expandParentsForSelectionItems(items);
			if (options.reveal && items.length === 1) {
				requestRevealSelectionItem(items[0]);
			}

			selectionController.setSelectedItems(items);
		},
		[
			canSelectItem,
			expandParentsForSelectionItems,
			requestRevealSelectionItem,
			selectionController,
			timelineSelectionScope,
		],
	);

	const registerMarqueeSelectableItem = useCallback(
		(item: TimelineSelection, getRect: () => DOMRect | null) => {
			const key = getTimelineSelectionKey(item);
			const registrationOrder = marqueeRegistrationCounter.current;
			marqueeRegistrationCounter.current += 1;
			marqueeSelectableItems.current.set(key, {
				getRect,
				item,
				order: registrationOrder,
			});
			return () => {
				marqueeSelectableItems.current.delete(key);
			};
		},
		[],
	);

	const getMarqueeSelectionForRect = useCallback(
		(
			marqueeRect: TimelineMarqueeRect,
			lockedSelectionKind: TimelineMarqueeSelectionKind | null,
		) => {
			const candidates = [...marqueeSelectableItems.current.values()]
				.sort((a, b) => a.order - b.order)
				.flatMap((candidate): TimelineMarqueeSelectionCandidate[] => {
					if (!canSelectItem(candidate.item)) {
						return [];
					}

					const rect = candidate.getRect();
					if (rect === null) {
						return [];
					}

					return [
						{
							item: candidate.item,
							rect: {
								bottom: rect.bottom,
								left: rect.left,
								right: rect.right,
								top: rect.top,
							},
						},
					];
				});

			return getTimelineMarqueeSelection({
				candidates,
				lockedSelectionKind,
				marqueeRect,
			});
		},
		[canSelectItem],
	);

	const clearSelection = useCallback(() => {
		selectionScope.current = null;
		selectionController.clear();
	}, [selectionController]);

	const containsSelection = useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			return availableSelectedItems.some(
				(selected) =>
					selected.type !== 'guide' &&
					nodePathDescendsFrom(selected.nodePathInfo, nodePathInfo),
			);
		},
		[availableSelectedItems],
	);

	const value = useMemo(
		(): TimelineSelectionContextValue => ({
			canSelect,
			revealRequest,
			selectedItems: availableSelectedItems,
			isSelected,
			selectItem,
			selectItems,
			registerMarqueeSelectableItem,
			getMarqueeSelection: getMarqueeSelectionForRect,
			containsSelection,
			clearSelection,
		}),
		[
			canSelect,
			revealRequest,
			availableSelectedItems,
			isSelected,
			selectItem,
			selectItems,
			registerMarqueeSelectableItem,
			getMarqueeSelectionForRect,
			containsSelection,
			clearSelection,
		],
	);
	const currentSelection = useRef(value);
	currentSelection.current = value;

	return (
		<CurrentTimelineSelectionContext.Provider value={currentSelection}>
			<TimelineSelectionContext.Provider value={value}>
				{children}
				<TimelineEscapeKeybindings />
				{isStudioInteractivityEnabled() ? (
					<>
						<TimelineClipboardKeybindings />
						<TimelineDeleteKeybindings />
					</>
				) : null}
			</TimelineSelectionContext.Provider>
		</CurrentTimelineSelectionContext.Provider>
	);
};

export const useTimelineSelection = () => {
	return useContext(TimelineSelectionContext);
};

export const TIMELINE_MARQUEE_ITEM_ATTR = 'data-timeline-marquee-item';
export const TIMELINE_SCRUBBER_ATTR = 'data-timeline-scrubber';

export const useCurrentTimelineSelectionStateAsRef = () => {
	const currentSelection = useContext(CurrentTimelineSelectionContext);
	if (currentSelection === null) {
		throw new Error(
			'useCurrentTimelineSelectionStateAsRef must be used inside TimelineSelectionProvider',
		);
	}

	return currentSelection;
};

export const useTimelineMarqueeSelection = () => {
	const {canSelect, getMarqueeSelection, selectedItems, selectItems} =
		useTimelineSelection();
	const {isHighestContext} = useZIndex();
	const [marqueeRect, setMarqueeRect] = useState<TimelineMarqueeRect | null>(
		null,
	);

	const onPointerDownCapture = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!isHighestContext) {
				return;
			}

			if (event.button !== 0 || !canSelect) {
				return;
			}

			if (event.shiftKey) {
				return;
			}

			if (!(event.target instanceof Element)) {
				return;
			}

			if (
				event.target.closest(`[${TIMELINE_MARQUEE_ITEM_ATTR}]`) ||
				event.target.closest(`[${TIMELINE_SCRUBBER_ATTR}]`)
			) {
				return;
			}

			const {currentTarget: target} = event;

			const scrollable = scrollableRef.current;
			const verticalScroll = timelineVerticalScroll.current;
			const initialScrollLeft = scrollable?.scrollLeft ?? 0;
			const initialScrollTop = verticalScroll?.scrollTop ?? 0;

			const initialBounds = target.getBoundingClientRect();
			const start = getClampedTimelineMarqueePoint({
				bounds: {
					bottom: initialBounds.bottom,
					left: initialBounds.left,
					right: initialBounds.right,
					top: initialBounds.top,
				},
				x: event.clientX,
				y: event.clientY,
			});
			const startX = start.x;
			const startY = start.y;
			const previousUserSelect = document.body.style.userSelect;
			const previousWebkitUserSelect = document.body.style.webkitUserSelect;
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';

			let hasDragged = false;
			let lockedSelectionKind: TimelineMarqueeSelectionKind | null = null;
			let lastClientX = event.clientX;
			let lastClientY = event.clientY;
			const extendSelection = event.metaKey || event.ctrlKey;
			const selectionBeforeMarquee = selectedItems;

			const updateSelection = (clientX: number, clientY: number) => {
				lastClientX = clientX;
				lastClientY = clientY;

				// The container moves when the timeline scrolls vertically, so read
				// the bounds live. Restrict them to the visible viewport of the
				// vertical scroller so the fixed-positioned marquee cannot paint
				// outside the visible timeline area.
				const liveBounds = target.getBoundingClientRect();
				const verticalRect = verticalScroll?.getBoundingClientRect() ?? null;
				const bounds: TimelineMarqueeRect = {
					bottom:
						verticalRect === null
							? liveBounds.bottom
							: Math.min(liveBounds.bottom, verticalRect.bottom),
					left: liveBounds.left,
					right: liveBounds.right,
					top:
						verticalRect === null
							? liveBounds.top
							: Math.max(liveBounds.top, verticalRect.top),
				};

				// The anchor is fixed to timeline content, not to the screen:
				// compensate for any scrolling that happened since pointerdown so the
				// marquee keeps covering the originally spanned content while
				// edge auto-scrolling. It is deliberately not clamped to the bounds -
				// it may sit outside the viewport, and the selection should still
				// include everything between it and the pointer.
				const scrollDeltaX = (scrollable?.scrollLeft ?? 0) - initialScrollLeft;
				const scrollDeltaY =
					(verticalScroll?.scrollTop ?? 0) - initialScrollTop;
				const anchorX = startX - scrollDeltaX;
				const anchorY = startY - scrollDeltaY;

				const current = getClampedTimelineMarqueePoint({
					bounds,
					x: clientX,
					y: clientY,
				});
				if (
					!hasDragged &&
					Math.max(
						Math.abs(current.x - anchorX),
						Math.abs(current.y - anchorY),
					) < 3
				) {
					return;
				}

				hasDragged = true;
				const rect = getNormalizedTimelineMarqueeRect({
					currentX: current.x,
					currentY: current.y,
					startX: anchorX,
					startY: anchorY,
				});
				const nextSelection = getMarqueeSelection(rect, lockedSelectionKind);
				lockedSelectionKind = nextSelection.lockedSelectionKind;
				setMarqueeRect({
					bottom: Math.min(rect.bottom, bounds.bottom),
					left: Math.max(rect.left, bounds.left),
					right: Math.min(rect.right, bounds.right),
					top: Math.max(rect.top, bounds.top),
				});
				selectItems(
					extendSelection
						? extendTimelineMarqueeSelection({
								currentSelection: selectionBeforeMarquee,
								marqueeSelection: nextSelection.selectedItems,
							})
						: nextSelection.selectedItems,
				);
			};

			const autoScroll = startTimelineEdgeAutoScroll({
				includeHorizontal: true,
				includeVertical: true,
				verticalTopOffset: 0,
				onTick: (directions) => {
					if (scrollable && directions.x !== null) {
						scrollable.scrollLeft +=
							directions.x === 'left' ? -SCROLL_INCREMENT : SCROLL_INCREMENT;
					}

					if (verticalScroll && directions.y !== null) {
						verticalScroll.scrollTop +=
							directions.y === 'up'
								? -EDGE_SCROLL_VERTICAL_INCREMENT
								: EDGE_SCROLL_VERTICAL_INCREMENT;
					}

					updateSelection(lastClientX, lastClientY);
				},
			});

			const cleanup = () => {
				autoScroll.stop();
				document.body.style.userSelect = previousUserSelect;
				document.body.style.webkitUserSelect = previousWebkitUserSelect;
				setMarqueeRect(null);
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				updateSelection(moveEvent.clientX, moveEvent.clientY);
				// Only auto-scroll for an actual marquee drag, not a plain click
				// near an edge
				if (hasDragged) {
					autoScroll.update(moveEvent);
				}
			};

			startCapturedPointerSession({
				event,
				captureTarget: target,
				onMove: onPointerMove,
				onEnd: (reason, endEvent) => {
					if (
						(reason === 'pointerup' || reason === 'buttons-released') &&
						endEvent
					) {
						updateSelection(endEvent.clientX, endEvent.clientY);
					}

					cleanup();
				},
			});
		},
		[
			canSelect,
			getMarqueeSelection,
			isHighestContext,
			selectedItems,
			selectItems,
		],
	);

	return {marqueeRect, onPointerDownCapture};
};

export const useTimelineMarqueeSelectableItem = (
	item: TimelineSelection | null,
	ref: React.RefObject<Element | null>,
) => {
	const {registerMarqueeSelectableItem} = useTimelineSelection();

	useEffect(() => {
		if (item === null) {
			return;
		}

		return registerMarqueeSelectableItem(
			item,
			() => ref.current?.getBoundingClientRect() ?? null,
		);
	}, [item, ref, registerMarqueeSelectableItem]);
};

export const useTimelineRowSelection = (
	nodePathInfo: SequenceNodePathInfo | null,
) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectableTimelineItemsRef = useContext(SelectableTimelineItemsContext);
	const selectionItem = useMemo(
		(): TimelineSelection | null =>
			getTimelineSelectionFromNodePathInfo(nodePathInfo),
		[nodePathInfo],
	);

	const selected = selectionItem === null ? false : isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			if (selectionItem === null) {
				return;
			}

			selectItem(
				selectionItem,
				interaction,
				selectableTimelineItemsRef.current,
			);
		},
		[selectItem, selectableTimelineItemsRef, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect && selectionItem !== null,
		selectionItem,
		selected,
	};
};

export const useTimelineKeyframeSelection = (
	nodePathInfo: SequenceNodePathInfo,
	frame: number,
) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectableTimelineItemsRef = useContext(SelectableTimelineItemsContext);
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'keyframe',
			nodePathInfo,
			frame,
		}),
		[nodePathInfo, frame],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			selectItem(
				selectionItem,
				interaction,
				selectableTimelineItemsRef.current,
			);
		},
		[selectItem, selectableTimelineItemsRef, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect,
		selectionItem,
		selected,
	};
};

export const useTimelineEasingSelection = ({
	nodePathInfo,
	fromFrame,
	toFrame,
	segmentIndex,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly segmentIndex: number;
}) => {
	const {canSelect, isSelected, selectItem} = useTimelineSelection();
	const selectableTimelineItemsRef = useContext(SelectableTimelineItemsContext);
	const selectionItem = useMemo(
		(): TimelineEasingSelection => ({
			type: 'easing',
			nodePathInfo,
			fromFrame,
			toFrame,
			segmentIndex,
		}),
		[nodePathInfo, fromFrame, segmentIndex, toFrame],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(
		(interaction?: TimelineSelectionInteraction) => {
			selectItem(
				selectionItem,
				interaction,
				selectableTimelineItemsRef.current,
			);
		},
		[selectItem, selectableTimelineItemsRef, selectionItem],
	);

	return {
		onSelect,
		selectable: canSelect,
		selected,
		selectionItem,
	};
};

export const useTimelineGuideSelection = (guideId: string) => {
	const {canSelect, clearSelection, isSelected, selectItem} =
		useTimelineSelection();
	const selectionItem = useMemo(
		(): TimelineSelection => ({
			type: 'guide',
			guideId,
		}),
		[guideId],
	);

	const selected = isSelected(selectionItem);

	const onSelect = useCallback(() => {
		selectItem(selectionItem);
	}, [selectItem, selectionItem]);

	return {
		clearSelection,
		onSelect,
		selectable: canSelect,
		selected,
		selectionItem,
	};
};

export const useTimelineRowContainsSelection = (
	nodePathInfo: SequenceNodePathInfo | null,
): boolean => {
	const {containsSelection} = useTimelineSelection();
	if (nodePathInfo === null) {
		return false;
	}

	return containsSelection(nodePathInfo);
};

export const useTimelineRowHighlightBackground = (
	nodePathInfo: SequenceNodePathInfo | null,
	{
		hovered,
		selectedBackground,
	}: {
		readonly hovered: boolean;
		readonly selectedBackground: string;
	},
): string | undefined => {
	const {selected} = useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	return getTimelineRowHighlightBackground({
		showSelectedBackground: true,
		selected,
		containsSelection,
		hovered,
		selectedBackground,
	});
};
