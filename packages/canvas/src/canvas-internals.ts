// Shared with Remotion Studio through CanvasInternals on the package root.
export {calculateTimeline} from './calculate-timeline';
export {useIsCanvasSequenceHovered} from './hover';
export type {
	CanvasOutline,
	CanvasOutlinePoint,
	CanvasOutlineUv,
	CanvasOutlineCrop,
	CanvasOutlineMatrix,
	CanvasOutlinePath,
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
	TimelineLoopDisplay,
	TimelineTrackWithOriginalTimings,
} from './get-timeline-sequence-sort-key';
export {
	EMPTY_CANVAS_SELECTION,
	getCanvasSelectionAfterInteraction,
	getCanvasSequenceSelectionKey,
	useCanvasSelectionController,
} from './selection';
export {sortItemsByCommitOrder} from './sort-by-commit-order';
export {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
export {useCanvasRuntimeValueSnapshots} from './use-runtime-value-snapshots';
