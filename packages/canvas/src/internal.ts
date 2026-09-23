// Shared with Remotion Studio. This entry point is not part of the supported @remotion/canvas API.
export {calculateTimeline} from './calculate-timeline';
export {Canvas} from './canvas';
export type {CanvasProps} from './canvas';
export {createCanvasController, useCanvasController} from './canvas-controller';
export type {CanvasController} from './canvas-controller';
export {
	createCanvasHoverController,
	useCanvasHover,
	useCanvasSequenceHover,
	useIsCanvasSequenceHovered,
} from './hover';
export type {CanvasHover, CanvasHoverController} from './hover';
export type {
	CanvasOutline,
	CanvasOutlinePoint,
	CanvasOutlineUv,
	CanvasOutlineCrop,
	CanvasOutlineTarget,
} from './outline-geometry';
export {getCanvasOutlinePoint, getCanvasOutlineUv} from './outline-geometry';
export {
	measureCanvasOutlineTargets,
	cropCanvasOutlinePoints,
	canvasOutlinesAreEqual,
	getTransformedSvgViewportPoints,
} from './outline-measurement';
export {orderCanvasOutlinesForRendering} from './outline-order';
export type {
	CanvasOutlineOrderTarget,
	CanvasOutlineSequenceParent,
} from './outline-order';
export {useCanvasOutlineMeasurements} from './use-canvas-outline-measurements';
export {useCanvasOutlines} from './use-canvas-outlines';
export type {CanvasOutlineRenderTarget} from './use-canvas-outlines';
export {CanvasOutlinePolygon} from './canvas-outline-polygon';
export type {CanvasOutlinePolygonProps} from './canvas-outline-polygon';
export {
	getCanvasOutlineSelectionInteraction,
	handleCanvasOutlinePointerDown,
} from './outline-interaction';
export type {CanvasOutlinePointerDownDecision} from './outline-interaction';
export {
	getCanvasActiveOutlineTargets,
	getCanvasOutlineActivity,
	getCanvasOutlineLayoutTargets,
	getCanvasSelectableOutlines,
	getCanvasSelectedSequenceKeys,
	getCanvasSequenceKeysContainingSelection,
	getCanvasVisibleOutlineTargets,
} from './outline-targets';
export type {
	CanvasSelectableOutline,
	CanvasOutlineLayoutTarget,
} from './outline-targets';
export {getCanvasSequenceNodePathInfo} from './sequence-node-path';
export type {CanvasSequenceNodePathResolver} from './sequence-node-path';
export {getConnectedCompositions} from './get-connected-compositions';
export {
	getParentSequencePlaybackRate,
	getCascadedStart,
	getCascadedStartWithTrim,
	getTimelineVisibleDuration,
	getTimelineVisibleStart,
} from './get-sequence-visible-range';
export {getTimelineNestedLevel} from './get-timeline-nestedness';
export {getTimelineSequenceSortKey} from './get-timeline-sequence-sort-key';
export type {
	SequenceNodePathInfo,
	TimelineLoopDisplay,
	TimelineTrackData,
	TimelineTrackWithOriginalTimings,
} from './get-timeline-sequence-sort-key';
export {
	createCanvasSelectionController,
	EMPTY_CANVAS_SELECTION,
	getCanvasSelectionAfterInteraction,
	getCanvasSelectionItemKey,
	getCanvasSequenceSelectionKey,
	useCanvasSelection,
	useCanvasSelectionController,
} from './selection';
export type {
	CanvasSelectionController,
	CanvasSelectionItem,
	CanvasSelectionInteraction,
	CanvasSelectionSnapshot,
} from './selection';
export {sortItemsByCommitOrder} from './sort-by-commit-order';
export {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
export {useCanvasRuntimeValueSnapshots} from './use-runtime-value-snapshots';
