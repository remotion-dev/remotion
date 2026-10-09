// Shared with Remotion Studio through CanvasInternals on the package root.
export {
	collectReactCommit,
	installReactCommitObserver,
} from './react-commit-adapter';
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
export {
	getCanvasOutlinePoint,
	getCanvasOutlineUv,
	scaleCanvasOutline,
} from './outline-geometry';
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
export {
	isPointerSessionRelease,
	observePointerRelease,
	startCapturedPointerSession,
	startDeferredCapturedPointerSession,
} from './pointer-session';
export type {PointerSessionEndReason} from './pointer-session';
export {
	parseTranslate,
	parseTranslateWithUnits,
	serializeTranslate,
	serializeTranslateWithUnits,
} from './translate-value';
export type {
	ParsedTranslate,
	ParsedTranslateWithUnits,
	TranslateUnit,
} from './translate-value';
export {
	getKeyframeDisplayOffset,
	getKeyframeLocalFrame,
	getKeyframePlaybackRate,
	getKeyframeSourceFrame,
	getTimelineKeyframes,
	resolveKeyframeSourceFrame,
} from './keyframe-frames';
export type {KeyframeSourceFrame} from './keyframe-frames';
export {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from './keyframe-navigation';
export {
	getCanvasKeyframeValueAtSourceFrame,
	getCanvasKeyframeValueToAdd,
	isCanvasKeyframablePropStatus,
	normalizeFontWeightForKeyframe,
} from './keyframe-value';
export {
	canMoveCanvasKeyframes,
	getBoundedKeyframeDragDelta,
	getCanvasKeyframeMove,
	getMovedCanvasKeyframeOverride,
	getMovedCanvasKeyframeStatus,
} from './keyframe-move';
export type {CanvasKeyframeMoveTarget} from './keyframe-move';
export {getSchemaField} from './keyframes';
export {
	canEditKeyframeEasing,
	getKeyframeSegmentEasing,
	getKeyframeSegments,
} from './keyframe-easing';
export type {KeyframeSegment} from './keyframe-easing';
export {
	canvasOutlineSnapThresholdPx,
	findCanvasOutlineSnap,
	getCanvasOutlineSnapTargets,
} from './outline-snap';
export type {
	CanvasOutlineSnapAxis,
	CanvasOutlineSnapEdge,
	CanvasOutlineSnapGuide,
	CanvasOutlineSnapPoint,
	CanvasOutlineSnapResult,
	CanvasOutlineSnapTarget,
	CanvasOutlineSnapTargetType,
} from './outline-snap';
export {CanvasOutlineSnapLines} from './canvas-outline-snap-lines';
export {
	applyCanvasOutlineDragAxisLock,
	applyCanvasOutlineTranslateDelta,
	canvasOutlineDragThresholdPx,
	canvasTranslateFieldKey,
	clearCanvasOutlineDragOverrides,
	createCanvasOutlineTranslateSession,
	getCanvasOutlineNudgeDelta,
	getCanvasOutlineNudgeDeltas,
	getCanvasOutlineNudgeDirection,
	getCanvasOutlineTranslateDragChanges,
	getCanvasOutlineTranslateDragStates,
	getCanvasOutlineTranslateDragValues,
	isCanvasOutlineDragPastThreshold,
	startCanvasOutlineTranslateDrag,
} from './outline-translate-drag';
export type {
	CanvasOutlineDragChange,
	CanvasOutlineKeyframedDragChange,
	CanvasOutlineNudgeDirection,
	CanvasOutlineStaticDragChange,
	CanvasOutlineTranslateDragEnd,
	CanvasOutlineTranslateDragSnapping,
	CanvasOutlineTranslateDragState,
	CanvasOutlineTranslatePropStatus,
	CanvasOutlineTranslateSession,
	CanvasOutlineTranslateTarget,
	SetCanvasDragOverrides,
} from './outline-translate-drag';
