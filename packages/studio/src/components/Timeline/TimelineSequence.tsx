import type {TimelineTrackData} from '@remotion/sdk';
import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	_InternalTypes,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BLUE,
	RED,
	TIMELINE_AUDIO_GRADIENT,
	TIMELINE_BACKGROUND_COLOR,
	TIMELINE_CAPTIONS_GRADIENT,
	TIMELINE_NEGATIVE_START_BACKGROUND_COLOR,
	TIMELINE_NEGATIVE_START_BORDER_COLOR,
	TIMELINE_VIDEO_GRADIENT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_20,
	WHITE_ALPHA_60,
} from '../../helpers/colors';
import {createDragAwareDoubleClickTracker} from '../../helpers/drag-aware-double-click';
import {
	getConnectedCompositionFrame,
	getSequenceDoubleClickAction,
} from '../../helpers/get-sequence-double-click-action';
import {getTimelineNaturalMediaDuration} from '../../helpers/get-timeline-natural-media-duration';
import {getTimelineSequenceLayout} from '../../helpers/get-timeline-sequence-layout';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {isVideoWithLastFrameHold} from '../../helpers/is-video-with-last-frame-hold';
import {
	getStudioShowLayerFrameNumbers,
	getStudioShowPremounting,
} from '../../helpers/studio-runtime-config';
import {
	getTimelineLayerHeight,
	TIMELINE_LAYER_HEIGHT_AUDIO,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {useMediaMetadata} from '../../helpers/use-media-metadata';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {SnowflakeIcon} from '../../icons/snowflake';
import {SetSelectedModalContext} from '../../state/modals';
import {TimelineZoomActiveContext} from '../../state/timeline-zoom';
import {AudioWaveform} from '../AudioWaveform';
import {CompositionOrStillIcon} from '../CompositionOrStillIcon';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {ContextMenu} from '../ContextMenu';
import {useSelectComposition} from '../InitialCompositionLoader';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {useSelectAsset} from '../use-select-asset';
import {disableSequenceInteractivity} from './disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {getKeyframeTrimConstraints} from './get-keyframe-trim-constraints';
import {
	getMultiSequenceContextMenuItems,
	getSequenceContextMenuItems,
} from './get-sequence-context-menu-items';
import {getSequenceSplitMenuItem} from './get-sequence-split-menu-item';
import {getSequenceUnwrapMenuItem} from './get-sequence-unwrap-menu-item';
import {getSequencesContextForAgents} from './get-sequences-context-for-agents';
import {getTimelineMediaStartFrame} from './get-timeline-media-start-frame';
import {
	getTimelineSceneClipPath,
	getTimelineSceneShape,
	TIMELINE_CHILD_TRANSITION_SEAM_Y,
} from './get-timeline-scene-clip-path';
import {getTimelineSequenceVisibleLayout} from './get-timeline-sequence-visible-layout';
import {getTimelineTransitionNeighbors} from './get-timeline-transition-neighbors';
import {getTimelineTrimHandleLayout} from './get-timeline-trim-handle-layout';
import {getTimelineVolume} from './get-timeline-volume';
import {getCurrentFrame} from './imperative-state';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {splitSelectedTimelineItems} from './split-selected-timeline-item';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';
import {timelineLeftEdgeCursor} from './timeline-left-edge-cursor';
import {timelineLayerLayoutsRef} from './timeline-refs';
import {timelineRightEdgeCursor} from './timeline-right-edge-cursor';
import {
	PACKED_LABEL_BOTTOM,
	TimelineSequenceLabel,
} from './timeline-sequence-label';
import {timelineSourceOnlyCursor} from './timeline-source-only-cursor';
import {
	getTimelineSequenceHeight,
	hasTimelineTrackMediaLabel,
	TIMELINE_PACKED_TRACK_HEIGHT,
} from './timeline-track-groups';
import {timelineTrimEdgeCursor} from './timeline-trim-edge-cursor';
import {TimelineImageInfo} from './TimelineImageInfo';
import {
	TimelineInheritedSceneRangeContext,
	TimelineSceneClipHeightContext,
	TimelineSceneRangeContext,
} from './TimelineSceneRangeContext';
import {
	getTimelineColor,
	getTimelineSequenceSelectionKey,
	isTimelineSelectionModifierEvent,
	TIMELINE_MARQUEE_ITEM_ATTR,
	useIsPremountingSelected,
	useTimelineMarqueeSelectableItem,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequenceCaptions} from './TimelineSequenceCaptions';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';
import {TimelineSequenceMountIndicator} from './TimelineSequenceMountIndicator';
import {
	canResizeTimelineSequenceDuration,
	getTimelineSequenceEndField,
	getTimelineSequenceMediaDurationDragLimits,
	isCascadingSequence,
	isTimelineSequenceDurationDraggable,
	isTimelineSequenceLeftEdgeDraggable,
	isTransitionSeriesSequence,
	TimelineSequenceLeftEdgeDragHandle,
	type TimelineSequenceLeftEdgeDragMode,
	TimelineSequenceMediaDurationDragLimitsContext,
	TimelineSequenceRightEdgeDragHandle,
	useTimelineSequenceFromDrag,
} from './TimelineSequenceRightEdgeDragHandle';
import {
	TimelineUnclippedTrimContent,
	TimelineUndimmedTrimContent,
} from './TimelineTrimOutline';
import {TimelineVideoInfo} from './TimelineVideoInfo';
import {TimelineViewportContext} from './TimelineViewport';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useAssetTimelineContextMenu} from './use-asset-timeline-context-menu';
import {useDeleteTimelineItems} from './use-delete-timeline-items';
import {useOpenSequenceInApps} from './use-open-sequence-in-apps';
import {getSequenceFreezeFrameMenuItem} from './use-sequence-freeze-frame-menu-item';
import {
	useTimelineSequenceNaturalDuration,
	useTimelineSequenceRegistry,
} from './use-timeline-sequence-registry';

const NEGATIVE_START_BORDER_WIDTH = 1;
const EDGE_DRAG_HIGHLIGHT_WIDTH = 12;
// Leave room for a full 11px character before the label's 5px fade.
const MIN_TIMELINE_LABEL_WIDTH = 16;
const trimHighlightContainerStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
};
const trimHighlightBlurStyle: React.CSSProperties = {filter: 'blur(4px)'};
const transitionVerticalInset = Math.round(TIMELINE_PACKED_TRACK_HEIGHT * 0.2);
const transitionHeight =
	TIMELINE_PACKED_TRACK_HEIGHT - transitionVerticalInset * 2;
const transitionIconWidth = Math.round(transitionHeight * 1.5);
const minTransitionAreaWidth = transitionIconWidth + 8;

type TimelineEdgeHighlightEdge = 'left' | 'right' | 'source-only';

type TimelineEdgeHighlightState = {
	readonly edge: TimelineEdgeHighlightEdge;
	readonly isDragging: boolean;
	readonly showTrimOutline: boolean;
	readonly isAtLimit: boolean;
};

type TimelineEdgeHighlight = Omit<TimelineEdgeHighlightState, 'isAtLimit'> & {
	readonly nodePathKey: string;
};

const TimelineEdgeHighlightContext = React.createContext<{
	readonly register: (
		nodePathKey: string,
		listener: React.Dispatch<
			React.SetStateAction<TimelineEdgeHighlightState | null>
		>,
	) => () => void;
	readonly setHighlights: (
		highlights: readonly TimelineEdgeHighlight[],
	) => void;
	readonly setLimitReached: (isAtLimit: boolean) => void;
} | null>(null);

export const TimelineEdgeHighlightProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	// Keep the context value stable so highlighting boundaries does not re-render
	// every timeline sequence through a context broadcast.
	const value = useMemo(() => {
		let highlights = new Map<string, TimelineEdgeHighlightState>();
		const listeners = new Map<
			string,
			Set<
				React.Dispatch<React.SetStateAction<TimelineEdgeHighlightState | null>>
			>
		>();

		return {
			register: (
				nodePathKey: string,
				listener: React.Dispatch<
					React.SetStateAction<TimelineEdgeHighlightState | null>
				>,
			) => {
				const listenersForNodePath = listeners.get(nodePathKey) ?? new Set();
				listenersForNodePath.add(listener);
				listeners.set(nodePathKey, listenersForNodePath);
				listener(highlights.get(nodePathKey) ?? null);

				return () => {
					const currentListeners = listeners.get(nodePathKey);
					currentListeners?.delete(listener);
					if (currentListeners?.size === 0) {
						listeners.delete(nodePathKey);
					}
				};
			},
			setHighlights: (nextHighlights: readonly TimelineEdgeHighlight[]) => {
				const nextHighlightMap = new Map(
					nextHighlights.map((highlight) => [
						highlight.nodePathKey,
						{...highlight, isAtLimit: false},
					]),
				);
				const changedNodePathKeys = new Set([
					...highlights.keys(),
					...nextHighlightMap.keys(),
				]);
				for (const nodePathKey of changedNodePathKeys) {
					const previousEdge = highlights.get(nodePathKey) ?? null;
					const nextEdge = nextHighlightMap.get(nodePathKey) ?? null;
					if (
						previousEdge?.edge !== nextEdge?.edge ||
						previousEdge?.isAtLimit !== nextEdge?.isAtLimit ||
						previousEdge?.showTrimOutline !== nextEdge?.showTrimOutline ||
						previousEdge?.isDragging !== nextEdge?.isDragging
					) {
						for (const listener of listeners.get(nodePathKey) ?? []) {
							listener(nextEdge);
						}
					}
				}

				highlights = nextHighlightMap;
			},
			setLimitReached: (isAtLimit: boolean) => {
				for (const [nodePathKey, highlight] of highlights) {
					if (highlight.isAtLimit === isAtLimit) continue;
					const next = {...highlight, isAtLimit};
					highlights.set(nodePathKey, next);
					for (const listener of listeners.get(nodePathKey) ?? []) {
						listener(next);
					}
				}
			},
		};
	}, []);

	return (
		<TimelineEdgeHighlightContext.Provider value={value}>
			{children}
		</TimelineEdgeHighlightContext.Provider>
	);
};

type TimelineSequenceProps = {
	readonly s: TimelineTrackData['sequence'];
	readonly labelStartFrame: number | null;
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly sequenceFrameOffset: number;
	readonly cascadedStart: number;
	readonly localStart: number;
	readonly parentVisibleStart: number;
	readonly parentVisibleEnd: number | null;
};

const TimelineSequenceNegativeStartInner: React.FC<{
	readonly left: number;
	readonly width: number;
	readonly leftEdgeVisible: boolean;
	readonly clipped: boolean;
}> = ({left, width, leftEdgeVisible, clipped}) => {
	const outerStyle = useMemo((): React.CSSProperties => {
		return {
			backgroundColor: clipped ? TIMELINE_BACKGROUND_COLOR : undefined,
			height: '100%',
			left,
			minWidth: 2,
			pointerEvents: 'none',
			position: 'absolute',
			top: 0,
			width,
		};
	}, [clipped, left, width]);

	const innerStyle = useMemo((): React.CSSProperties => {
		const showLeftEdge = leftEdgeVisible && !clipped;
		const maskImage = clipped
			? 'linear-gradient(to right, transparent, black 20%)'
			: undefined;

		return {
			backgroundColor: TIMELINE_NEGATIVE_START_BACKGROUND_COLOR,
			border: `${NEGATIVE_START_BORDER_WIDTH}px solid ${TIMELINE_NEGATIVE_START_BORDER_COLOR}`,
			borderBottomLeftRadius: showLeftEdge ? 2 : 0,
			borderLeft: showLeftEdge
				? `${NEGATIVE_START_BORDER_WIDTH}px solid ${TIMELINE_NEGATIVE_START_BORDER_COLOR}`
				: 'none',
			borderRight: 'none',
			borderTopLeftRadius: showLeftEdge ? 2 : 0,
			boxSizing: 'border-box',
			height: '100%',
			maskImage,
			position: 'absolute',
			top: 0,
			WebkitMaskImage: maskImage,
			width: '100%',
		};
	}, [clipped, leftEdgeVisible]);

	return (
		<div style={outerStyle}>
			<div style={innerStyle} />
		</div>
	);
};

const TimelineSequenceNegativeStart = React.memo(
	TimelineSequenceNegativeStartInner,
);

const TimelineSequenceBar: React.FC<{
	readonly s: TSequence;
	readonly labelOffset: number;
	readonly captionLabelBounds: {
		readonly left: number;
		readonly width: number;
	} | null;
	readonly captionRange: {
		readonly startMs: number;
		readonly endMs: number;
	} | null;
	readonly hasCaptionsSchema: boolean;
	readonly connectedComposition: _InternalTypes['AnyComposition'] | null;
	readonly activeTrimEdge: 'left' | 'right' | null;
	readonly isAtTrimLimit: boolean;
	readonly leftTrimHighlight: {
		readonly left: number;
		readonly width: number;
	} | null;
	readonly displayDurationInFrames: number;
	readonly selectionBounds: {
		readonly left: number;
		readonly width: number;
	} | null;
	readonly premount: {readonly left: number; readonly width: number} | null;
	readonly showPremounting: boolean;
	readonly postmount: {readonly left: number; readonly width: number} | null;
	readonly negativeStart: {
		readonly left: number;
		readonly width: number;
	} | null;
	readonly leftEdgeVisible: boolean;
	readonly rightEdgeVisible: boolean;
	readonly negativeStartClipped: boolean;
	readonly style: React.CSSProperties;
	readonly marqueeHorizontalBounds: {
		readonly cropLeft: number;
		readonly width: number;
	} | null;
	readonly children: React.ReactNode;
	readonly edgeDragHandles: React.ReactNode;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
	readonly fromCanUpdate: boolean;
	readonly frozenFrame: number | null;
	readonly onMoveDragPointerDown: (
		e: React.PointerEvent<HTMLDivElement>,
	) => void;
	readonly onPointerDownCapture: React.PointerEventHandler<HTMLDivElement>;
	readonly onPointerEnter: () => void;
	readonly onClick: React.MouseEventHandler<HTMLDivElement> | null;
}> = ({
	s,
	labelOffset,
	captionLabelBounds,
	captionRange,
	hasCaptionsSchema,
	connectedComposition,
	activeTrimEdge,
	isAtTrimLimit,
	leftTrimHighlight,
	displayDurationInFrames,
	selectionBounds,
	premount,
	showPremounting,
	postmount,
	negativeStart,
	leftEdgeVisible,
	rightEdgeVisible,
	negativeStartClipped,
	style,
	marqueeHorizontalBounds,
	children,
	edgeDragHandles,
	nodePathInfo,
	sequenceFrameOffset,
	fromCanUpdate,
	frozenFrame,
	onMoveDragPointerDown,
	onPointerDownCapture,
	onPointerEnter,
	onClick,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const showLayerFrameNumbers = getStudioShowLayerFrameNumbers();
	const sceneRange = useContext(TimelineSceneRangeContext);
	const inheritedSceneRange = useContext(TimelineInheritedSceneRangeContext);
	const sceneClipHeight = useContext(TimelineSceneClipHeightContext);
	const timelineWidth = useContext(TimelineWidthContext);
	const video = Internals.useUnsafeVideoConfig();
	const {onSelect, selectable, selected, selectionItem} =
		useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const isTransition = s.timelineTrack?.role === 'transition';
	const isPackedClip =
		s.timelineTrack?.role === 'clip' && s.timelineTrack.seriesOffset !== null;
	useTimelineMarqueeSelectableItem(
		selectionItem,
		ref,
		isTransition ? null : marqueeHorizontalBounds,
	);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button === 0) {
				e.stopPropagation();
				if (isTimelineSelectionModifierEvent(e)) {
					onSelect({
						shiftKey: e.shiftKey,
						toggleKey: e.metaKey || e.ctrlKey,
					});
					return;
				}

				if (fromCanUpdate) {
					onMoveDragPointerDown(e);
				}
			}
		},
		[fromCanUpdate, onMoveDragPointerDown, onSelect],
	);
	const negativeStartEnd = negativeStart
		? negativeStart.left + negativeStart.width
		: 0;
	const frameIncrement =
		timelineWidth !== null && video !== null
			? (timelineWidth - TIMELINE_PADDING * 2) / video.durationInFrames
			: null;
	const transitionBounds =
		isTransition && frameIncrement !== null
			? {
					left: Math.round(s.from * frameIncrement) - Number(style.marginLeft),
					width:
						Math.round((s.from + s.duration) * frameIncrement) -
						Math.round(s.from * frameIncrement),
				}
			: null;
	const sceneLeft =
		sceneRange !== null && frameIncrement !== null
			? sceneRange.from * frameIncrement - Number(style.marginLeft)
			: -Infinity;
	const sceneRight =
		sceneRange !== null && frameIncrement !== null
			? sceneRange.end * frameIncrement - Number(style.marginLeft)
			: Infinity;
	let labelLeft =
		2.5 +
		(captionLabelBounds?.left ??
			Math.max(labelOffset, negativeStartEnd + (premount?.width ?? 0)));
	if (
		isPackedClip &&
		sceneRange !== null &&
		sceneRange.transitionInEnd !== null &&
		frameIncrement !== null
	) {
		const incomingTransitionWidth =
			(sceneRange.transitionInEnd - sceneRange.from) * frameIncrement;
		const afterTransition =
			incomingTransitionWidth >= minTransitionAreaWidth
				? Math.round(sceneRange.transitionInEnd * frameIncrement) + 4
				: sceneRange.transitionInEnd * frameIncrement + 2.5;
		labelLeft = Math.max(labelLeft, afterTransition - Number(style.marginLeft));
	}

	if (isPackedClip && inheritedSceneRange !== null && frameIncrement !== null) {
		const inheritedLeft =
			Math.round(inheritedSceneRange.from * frameIncrement) +
			Number(inheritedSceneRange.transitionInEnd !== null) -
			Number(style.marginLeft);
		labelLeft = Math.max(labelLeft, Math.max(0, inheritedLeft) + 4);
	}

	const labelEndFrame = Math.min(
		sceneRange?.transitionOutStart ?? Infinity,
		inheritedSceneRange?.transitionOutStart ?? Infinity,
	);
	const labelRight = Math.max(
		captionLabelBounds === null
			? 0
			: Number(style.width) -
					captionLabelBounds.left -
					captionLabelBounds.width,
		frameIncrement === null || !Number.isFinite(labelEndFrame)
			? -Infinity
			: Number(style.width) -
					(Math.round(labelEndFrame * frameIncrement) -
						Number(style.marginLeft)),
	);

	const paintedStart = Math.max(negativeStartEnd, sceneLeft);
	const paintedEnd = Math.max(0, Math.min(Number(style.width), sceneRight));
	const sceneOwnsRightGap =
		sceneRange !== null &&
		sceneRange.transitionOutStart !== null &&
		// An inherited transition beyond this child scene cannot provide its gap.
		sceneRange.transitionOutStart < sceneRange.end &&
		// The scene contour already includes the pixel-aligned outgoing gap.
		// Allow for floating-point error when the bar ends at the same frame.
		sceneRight <= Number(style.width) + 0.0001;
	// Shared child rows need the same gap as Track clips, including when the
	// scene clips their trailing edge. Only inset the paint: timing, hit areas,
	// and trim handles keep their full width. Preserve tiny clips when zoomed out.
	const visualRightInset =
		!sceneOwnsRightGap &&
		(s.timelineTrack || sceneRange !== null) &&
		!isTransition &&
		(rightEdgeVisible || sceneRight <= Number(style.width))
			? Number(style.width) -
				paintedEnd +
				Math.min(1, Math.max(0, paintedEnd - paintedStart - 1))
			: 0;
	const selectionLeft = selectionBounds?.left ?? 0;
	const selectionRight = Math.max(
		visualRightInset,
		Number(style.width) - selectionLeft - (selectionBounds?.width ?? 0),
	);
	const selectionWidth = Number(style.width) - selectionLeft - selectionRight;
	const selectionShapes = useMemo(() => {
		if (
			!(selected || containsSelection) ||
			isTransition ||
			frameIncrement === null
		) {
			return [];
		}

		// A nested series has its own clip shape inside the parent scene's
		// contour. Stroke both boundaries; their containing clips intersect them.
		return [
			{key: 'sequence', range: sceneRange, packed: isPackedClip},
			{
				key: 'inherited',
				range: inheritedSceneRange === sceneRange ? null : inheritedSceneRange,
				packed: false,
			},
		].flatMap(({key, range, packed}) => {
			if (
				range === null ||
				(range.transitionInEnd === null && range.transitionOutStart === null)
			) {
				return [];
			}

			const shape = getTimelineSceneShape(
				{
					sceneRange: range,
					offsetInFrames:
						(Number(style.marginLeft) + selectionLeft) / frameIncrement,
					durationInFrames: selectionWidth / frameIncrement,
					pixelsPerFrame: frameIncrement,
					height: packed
						? Number(style.height)
						: (sceneClipHeight ?? Number(style.height)),
					seamY: packed
						? Number(style.height) / 2
						: TIMELINE_CHILD_TRANSITION_SEAM_Y,
					transitionCutout: packed
						? {
								top: transitionVerticalInset,
								height: transitionHeight,
								radius: 4,
								minWidth: minTransitionAreaWidth,
							}
						: null,
					cropHeight: Number(style.height),
				},
				true,
			);
			return shape === null ? [] : [{key, shape}];
		});
	}, [
		containsSelection,
		frameIncrement,
		isTransition,
		isPackedClip,
		inheritedSceneRange,
		sceneClipHeight,
		sceneRange,
		selected,
		selectionLeft,
		selectionWidth,
		style.height,
		style.marginLeft,
	]);
	const trimShape = useMemo(() => {
		if (activeTrimEdge === null || isTransition || frameIncrement === null) {
			return null;
		}

		return getTimelineSceneShape(
			{
				sceneRange,
				offsetInFrames: Number(style.marginLeft) / frameIncrement,
				durationInFrames: Number(style.width) / frameIncrement,
				pixelsPerFrame: frameIncrement,
				height: isPackedClip
					? Number(style.height)
					: (sceneClipHeight ?? Number(style.height)),
				seamY: isPackedClip
					? Number(style.height) / 2
					: TIMELINE_CHILD_TRANSITION_SEAM_Y,
				transitionCutout: null,
				cropHeight: Number(style.height),
			},
			true,
		);
	}, [
		activeTrimEdge,
		isTransition,
		frameIncrement,
		sceneRange,
		style.marginLeft,
		style.width,
		style.height,
		isPackedClip,
		sceneClipHeight,
	]);
	const transitionTrimEdge =
		activeTrimEdge === null ? null : (trimShape?.edges[activeTrimEdge] ?? null);
	// Back the antialiased rounded edge only when the glow is at the painted layer edge.
	const trimHighlightColor = isAtTrimLimit ? RED : '#00E500';
	const sequenceBackground =
		activeTrimEdge === null ||
		transitionTrimEdge !== null ||
		(activeTrimEdge === 'left' && leftTrimHighlight?.left !== negativeStartEnd)
			? style.background
			: `linear-gradient(to ${activeTrimEdge === 'left' ? 'right' : 'left'}, ${trimHighlightColor} 0 2px, transparent 2px), ${style.background ?? TRANSPARENT}`;

	const sceneClippingStyle: React.CSSProperties = useMemo(() => {
		return {
			clipPath:
				isPackedClip && frameIncrement !== null
					? getTimelineSceneClipPath({
							sceneRange,
							offsetInFrames: Number(style.marginLeft) / frameIncrement,
							durationInFrames: Number(style.width) / frameIncrement,
							pixelsPerFrame: frameIncrement,
							height: Number(style.height),
							seamY: Number(style.height) / 2,
							transitionCutout: null,
							cropHeight: null,
						})
					: undefined,
		};
	}, [style, isPackedClip, frameIncrement, sceneRange]);

	const actualStyle: React.CSSProperties = useMemo(
		() => ({
			...style,
			background: TRANSPARENT,
			opacity: 1,
			pointerEvents: 'none',
		}),
		[style],
	);

	const premountIndicator = premount ? (
		<div
			style={{
				left: premount.left,
				width: premount.width,
				top: 0,
				height: '100%',
				background: `repeating-linear-gradient(
								-45deg,
								${TRANSPARENT},
								${TRANSPARENT} 2px,
								${WHITE_ALPHA_20} 2px,
								${WHITE_ALPHA_20} 4px
							)`,
				position: 'absolute',
			}}
		/>
	) : null;

	const trimHighlight =
		activeTrimEdge === null ||
		(activeTrimEdge === 'left' &&
			leftTrimHighlight === null) ? null : transitionTrimEdge !== null &&
		  trimShape ? (
			<svg
				aria-hidden="true"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: Number(style.width),
					height: Number(style.height),
					clipPath: trimShape.clipPath,
					overflow: 'hidden',
					pointerEvents: 'none',
				}}
			>
				<path
					d={transitionTrimEdge}
					fill="none"
					stroke={trimHighlightColor}
					strokeWidth={EDGE_DRAG_HIGHLIGHT_WIDTH}
					style={trimHighlightBlurStyle}
				/>
				<path
					d={transitionTrimEdge}
					fill="none"
					stroke={trimHighlightColor}
					strokeWidth={4}
				/>
			</svg>
		) : (
			<div
				aria-hidden="true"
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: activeTrimEdge === 'left' ? leftTrimHighlight?.left : undefined,
					right: activeTrimEdge === 'right' ? 0 : undefined,
					width:
						activeTrimEdge === 'left' && leftTrimHighlight
							? Math.min(EDGE_DRAG_HIGHLIGHT_WIDTH, leftTrimHighlight.width)
							: `min(${EDGE_DRAG_HIGHLIGHT_WIDTH}px, 100%)`,
					pointerEvents: 'none',
					background: `linear-gradient(to ${activeTrimEdge === 'left' ? 'right' : 'left'}, ${trimHighlightColor}, transparent)`,
				}}
			/>
		);

	// The stacked 10px icon and 15px label need 26px including the bottom inset.
	const inlineConnectedCompositionIcon =
		connectedComposition !== null &&
		Number(style.height) -
			(hasTimelineTrackMediaLabel(s) ? getTimelineLayerHeight(s.type) : 0) <
			26;
	const labelTextWidth =
		Number(style.width) -
		visualRightInset -
		labelRight -
		labelLeft -
		(inlineConnectedCompositionIcon ? 14 : 0) -
		(s.timelineTrack?.role === 'track' && frozenFrame !== null ? 16 : 0);

	const content = (
		<>
			{premountIndicator}

			{postmount ? (
				<TimelineSequenceMountIndicator
					from={s.from}
					displayDurationInFrames={displayDurationInFrames}
					mountDurationInFrames={s.postmountDisplay ?? 0}
					mountType="postmount"
					left={postmount.left}
					width={postmount.width}
				/>
			) : null}

			{children}

			{(s.timelineTrack || hasCaptionsSchema) &&
			!isTransition &&
			labelTextWidth >= MIN_TIMELINE_LABEL_WIDTH ? (
				<div
					style={{
						position: 'absolute',
						left: labelLeft,
						// Finish the label's fade before the transition cuts into the row.
						right: labelRight,
						bottom: PACKED_LABEL_BOTTOM,
						...(hasTimelineTrackMediaLabel(s)
							? {top: getTimelineLayerHeight(s.type)}
							: {}),
						display: 'flex',
						flexDirection: inlineConnectedCompositionIcon ? 'row' : 'column',
						alignItems: inlineConnectedCompositionIcon
							? 'center'
							: 'flex-start',
						gap: inlineConnectedCompositionIcon ? 4 : 0,
						overflow: 'hidden',
						pointerEvents: 'none',
						userSelect: 'none',
						WebkitUserSelect: 'none',
					}}
				>
					{connectedComposition ? (
						<CompositionOrStillIcon
							composition={connectedComposition}
							color={getTimelineColor(false, false)}
							style={{
								color: getTimelineColor(false, false),
								flexShrink: 0,
								height: 10,
								width: 10,
							}}
						/>
					) : null}
					{captionRange ? (
						<TimelineSequenceCaptions
							s={s}
							startMs={captionRange.startMs}
							endMs={captionRange.endMs}
						/>
					) : (
						<TimelineSequenceLabel
							label={
								s.timelineTrack?.role === 'track' && frozenFrame !== null
									? `${s.displayName} (frozen at frame ${frozenFrame})`
									: s.displayName
							}
						>
							{s.timelineTrack?.role === 'track' && frozenFrame !== null ? (
								<SnowflakeIcon
									aria-label={`Frozen at frame ${frozenFrame}`}
									color={getTimelineColor(false, false)}
									style={{
										width: 12,
										height: 12,
										marginRight: 4,
										verticalAlign: 'middle',
									}}
								/>
							) : null}
							{s.timelineTrack?.role === 'overlay' ? 'Overlay' : s.displayName}
						</TimelineSequenceLabel>
					)}
				</div>
			) : null}

			{showLayerFrameNumbers &&
			!hasCaptionsSchema &&
			!s.timelineTrack &&
			s.type !== 'audio' &&
			s.type !== 'video' &&
			s.type !== 'image' &&
			s.loopDisplay === undefined ? (
				<TimelineSequenceFrame
					s={s}
					sequenceFrameOffset={sequenceFrameOffset}
					displayDurationInFrames={displayDurationInFrames}
					paddingLeft={5 + negativeStartEnd + (premount?.width ?? 0)}
					frozenFrame={frozenFrame}
					showPremounting={showPremounting}
				/>
			) : null}
		</>
	);

	return (
		<div
			ref={isTransition ? null : ref}
			role={isTransition ? undefined : 'group'}
			{...{[TIMELINE_MARQUEE_ITEM_ATTR]: isTransition ? undefined : true}}
			style={actualStyle}
			aria-label={isTransition ? undefined : s.displayName}
			data-track-item={s.timelineTrack?.role}
			onPointerDownCapture={onPointerDownCapture}
			onPointerEnter={onPointerEnter}
			onPointerDown={selectable ? onPointerDown : undefined}
			onClick={onClick ?? undefined}
		>
			{isTransition ? (
				transitionBounds === null ||
				frameIncrement === null ||
				s.duration * frameIncrement < minTransitionAreaWidth ? null : (
					<div
						ref={ref}
						role="group"
						aria-label={s.displayName}
						{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
						data-timeline-transition-marker
						style={{
							position: 'absolute',
							left: transitionBounds.left,
							top: transitionVerticalInset,
							width: transitionBounds.width,
							height: transitionHeight,
							borderRadius: '4px 0 4px 0',
							background: TIMELINE_BACKGROUND_COLOR,
							pointerEvents: 'auto',
							cursor: 'default',
							boxShadow:
								selected || containsSelection
									? `inset 0 0 0 2px ${WHITE}`
									: undefined,
						}}
					>
						<svg
							aria-hidden="true"
							width={transitionIconWidth}
							height={transitionHeight}
							viewBox="0 0 24 16"
							style={{
								position: 'absolute',
								left: Math.round(
									(transitionBounds.width - transitionIconWidth) / 2,
								),
								top: 0,
							}}
						>
							<path
								d="M7.5 4.5 16.5 11.5v-7l-9 7Z"
								fill="none"
								stroke={selected || containsSelection ? WHITE : WHITE_ALPHA_60}
								strokeWidth={1}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						{edgeDragHandles}
					</div>
				)
			) : (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						...sceneClippingStyle,
						pointerEvents: 'auto',
					}}
				>
					{negativeStart ? (
						<>
							<TimelineSequenceNegativeStart
								left={negativeStart.left}
								width={negativeStart.width}
								leftEdgeVisible={leftEdgeVisible}
								clipped={negativeStartClipped}
							/>
							<div
								style={{
									background: sequenceBackground,
									borderBottomLeftRadius: 0,
									borderBottomRightRadius: style.borderBottomRightRadius,
									borderTopLeftRadius: 0,
									borderTopRightRadius: style.borderTopRightRadius,
									boxSizing: 'border-box',
									height: '100%',
									left: negativeStartEnd,
									overflow: 'hidden',
									position: 'absolute',
									top: 0,
									width: `calc(100% - ${negativeStartEnd + visualRightInset}px)`,
								}}
							>
								<div
									style={{
										height: '100%',
										left: -negativeStartEnd,
										position: 'absolute',
										top: 0,
										width: `calc(100% + ${negativeStartEnd}px)`,
									}}
								>
									{content}
								</div>
							</div>
						</>
					) : (
						<div
							style={{
								position: 'absolute',
								inset: 0,
								right: visualRightInset,
								background: sequenceBackground,
								overflow: 'hidden',
								borderRadius: 'inherit',
							}}
						>
							{content}
						</div>
					)}
					{!isTransition &&
					(selected || containsSelection) &&
					selectionBounds ? (
						selectionShapes.length > 0 ? (
							selectionShapes.map(({key, shape}) => (
								<svg
									key={key}
									aria-hidden="true"
									style={{
										position: 'absolute',
										left: selectionLeft,
										top: 0,
										width: selectionWidth,
										height: Number(style.height),
										clipPath: shape.clipPath,
										overflow: 'hidden',
										pointerEvents: 'none',
									}}
								>
									<path
										d={shape.path}
										fill="none"
										stroke={WHITE}
										// Half the stroke is clipped, matching the 2px inset outline.
										strokeWidth={4}
										strokeLinejoin="round"
										vectorEffect="non-scaling-stroke"
									/>
								</svg>
							))
						) : (
							<div
								aria-hidden="true"
								style={{
									position: 'absolute',
									inset: 0,
									left: selectionLeft,
									right: selectionRight,
									borderRadius: 'inherit',
									boxShadow: `inset 0 0 0 2px ${WHITE}`,
									pointerEvents: 'none',
								}}
							/>
						)
					) : null}
				</div>
			)}
			{isTransition ? null : edgeDragHandles}
			{trimHighlight === null ? null : (
				<TimelineUndimmedTrimContent>
					<div
						data-timeline-trim-highlight={activeTrimEdge}
						style={{
							...trimHighlightContainerStyle,
							...sceneClippingStyle,
						}}
					>
						<div
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								left: negativeStartEnd,
								right: visualRightInset,
								overflow: 'hidden',
								borderTopLeftRadius: negativeStart
									? 0
									: style.borderTopLeftRadius,
								borderBottomLeftRadius: negativeStart
									? 0
									: style.borderBottomLeftRadius,
								borderTopRightRadius: style.borderTopRightRadius,
								borderBottomRightRadius: style.borderBottomRightRadius,
							}}
						>
							<div
								style={{
									position: 'absolute',
									top: 0,
									bottom: 0,
									left: -negativeStartEnd,
									width: style.width,
								}}
							>
								{trimHighlight}
							</div>
						</div>
					</div>
				</TimelineUndimmedTrimContent>
			)}
		</div>
	);
};

const useTimelineSequenceState = (props: TimelineSequenceProps) => {
	const {
		s,
		connectedCompositions,
		nodePathInfo,
		keyframeDisplayOffset,
		keyframePlaybackRate,
		sequenceFrameOffset,
		cascadedStart,
	} = props;
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined

	const video = Internals.useVideo();
	const calculateTimeline = useTimelineCalculator();
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const registryEntry = useTimelineSequenceRegistry(s.id);
	const isTransitionInteraction =
		isTransitionSeriesSequence(s) || s.timelineTrack?.role === 'transition';
	const [transitionNeighbors, setTransitionNeighbors] =
		useState<ReturnType<typeof getTimelineTransitionNeighbors>>(null);
	const originalSequence = registryEntry?.sequence ?? null;
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const onPointerEnter = useCallback(() => {
		if (nodePath && isStudioInteractivityEnabled()) {
			getKeyframeTrimConstraints({
				propStatuses: propStatusesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
				sequences: sequencesRef.current,
				affectedNodePaths: [nodePath],
			});
		}

		if (!isTransitionInteraction) return;
		setTransitionNeighbors(
			getTimelineTransitionNeighbors({
				sequenceId: s.id,
				sequences: sequencesRef.current,
			}),
		);
	}, [
		isTransitionInteraction,
		nodePath,
		overrideIdToNodePathMappingsRef,
		propStatusesRef,
		s.id,
		sequencesRef,
	]);

	const mediaDurationDragLimitsRegistry = useContext(
		TimelineSequenceMediaDurationDragLimitsContext,
	);
	const edgeHighlightController = useContext(TimelineEdgeHighlightContext);
	const dragAwareDoubleClick = useMemo(
		() => createDragAwareDoubleClickTracker(),
		[],
	);
	const [activeHighlight, setActiveHighlight] =
		useState<TimelineEdgeHighlightState | null>(null);
	const activeEdgeHighlight = activeHighlight?.edge ?? null;
	const isAtTrimLimit = activeHighlight?.isAtLimit ?? false;
	const isEdgeDragging = activeHighlight?.isDragging ?? false;
	const activeTrimEdge =
		!isEdgeDragging && s.timelineTrack?.role === 'transition'
			? null
			: activeEdgeHighlight === 'source-only'
				? 'left'
				: activeEdgeHighlight;
	useEffect(() => {
		if (!nodePath) {
			return;
		}

		return edgeHighlightController?.register(
			stringifySequenceSubscriptionKey(nodePath),
			setActiveHighlight,
		);
	}, [edgeHighlightController, nodePath]);
	const naturalSequenceDuration = useTimelineSequenceNaturalDuration({
		sequenceId: s.id,
		enabled: isEdgeDragging,
	});
	const previousCascadingOverrideId =
		registryEntry?.previousOverrideId ??
		transitionNeighbors?.previous.controls?.overrideId ??
		null;
	const nextCascadingOverrideId =
		registryEntry?.nextOverrideId ??
		transitionNeighbors?.next.controls?.overrideId ??
		null;
	const previousTouchingSequence =
		registryEntry?.previousTouchingSequence ?? null;
	const nextTouchingSequence = registryEntry?.nextTouchingSequence ?? null;
	const previousTouchingOverrideId =
		previousTouchingSequence?.controls?.overrideId ?? null;
	const startEdgeDrag = useCallback(
		({
			edge,
			highlightAdjacent,
			isDragging,
			showTrimOutline,
			targetNodePaths,
		}: {
			readonly edge: TimelineEdgeHighlightEdge;
			readonly highlightAdjacent: boolean;
			readonly isDragging: boolean;
			readonly showTrimOutline: boolean;
			readonly targetNodePaths: readonly SequencePropsSubscriptionKey[];
		}) => {
			if (targetNodePaths.length === 0) {
				edgeHighlightController?.setHighlights([]);
				return;
			}

			const highlights = new Map<string, TimelineEdgeHighlightEdge>();
			for (const targetNodePath of targetNodePaths) {
				highlights.set(stringifySequenceSubscriptionKey(targetNodePath), edge);
			}

			if (highlightAdjacent) {
				const adjacentOverrideId =
					edge === 'left'
						? (previousCascadingOverrideId ?? previousTouchingOverrideId)
						: nextCascadingOverrideId;
				const adjacentNodePath = adjacentOverrideId
					? overrideIdToNodePathMappingsRef.current[adjacentOverrideId]
					: null;
				if (adjacentNodePath) {
					const adjacentNodePathKey =
						stringifySequenceSubscriptionKey(adjacentNodePath);
					if (!highlights.has(adjacentNodePathKey)) {
						highlights.set(
							adjacentNodePathKey,
							edge === 'left' ? 'right' : 'left',
						);
					}
				}
			}

			edgeHighlightController?.setHighlights(
				[...highlights].map(([nodePathKey, highlightEdge]) => ({
					nodePathKey,
					edge: highlightEdge,
					isDragging,
					showTrimOutline,
				})),
			);
		},
		[
			previousCascadingOverrideId,
			previousTouchingOverrideId,
			nextCascadingOverrideId,
			overrideIdToNodePathMappingsRef,
			edgeHighlightController,
		],
	);
	const startLeftEdgeDrag = useCallback(
		(
			mode: TimelineSequenceLeftEdgeDragMode,
			isDragging: boolean,
			targetNodePaths: readonly SequencePropsSubscriptionKey[],
		) =>
			startEdgeDrag({
				edge: mode === 'source-only' ? 'source-only' : 'left',
				highlightAdjacent: mode === 'ripple' || mode === 'rolling',
				isDragging,
				showTrimOutline: mode !== 'rolling',
				targetNodePaths,
			}),
		[startEdgeDrag],
	);
	const startRightEdgeDrag = useCallback(
		(
			isDragging: boolean,
			targetNodePaths: readonly SequencePropsSubscriptionKey[],
		) =>
			startEdgeDrag({
				edge: 'right',
				highlightAdjacent: false,
				isDragging,
				showTrimOutline: true,
				targetNodePaths,
			}),
		[startEdgeDrag],
	);
	const clearEdgeHighlight = useCallback(() => {
		edgeHighlightController?.setHighlights([]);
	}, [edgeHighlightController]);
	const endEdgeDrag = useCallback(
		(wasDragged: boolean) => {
			edgeHighlightController?.setHighlights([]);
			dragAwareDoubleClick.endPointerGesture(wasDragged);
		},
		[dragAwareDoubleClick, edgeHighlightController],
	);
	const onTrimLimitChange = useCallback(
		(isAtLimit: boolean) => {
			edgeHighlightController?.setLimitReached(isAtLimit);
		},
		[edgeHighlightController],
	);

	const mediaMetadata = useMediaMetadata(
		s.type === 'audio' || s.type === 'video' ? s.src : null,
	);
	const extendVideoLastFrame = isVideoWithLastFrameHold(s);
	const mediaStartFrame =
		s.type === 'audio' || s.type === 'video'
			? getTimelineMediaStartFrame({
					startMediaFrom: s.startMediaFrom,
					mediaFrameAtSequenceZero: s.mediaFrameAtSequenceZero,
					sequenceFrameOffset,
					playbackRate: s.playbackRate,
				})
			: 0;
	const mediaLoopStartFrame =
		mediaStartFrame -
		(s.loopDisplay?.mediaOffsetInFrames ?? 0) *
			(s.type === 'audio' || s.type === 'video'
				? s.playbackRate * s.sequencePlaybackRate
				: 0);
	const naturalMediaDuration = getTimelineNaturalMediaDuration({
		sequence: s,
		sequenceFrameOffset,
		mediaMetadata,
		fps: video?.fps ?? 30,
	});
	const maxMediaDuration =
		s.type === 'sequence' || s.type === 'image' || extendVideoLastFrame
			? Infinity
			: naturalMediaDuration;
	const effectiveMaxMediaDuration = s.loopDisplay ? null : maxMediaDuration;

	const {
		canConfigureApps,
		canOpenInEditor,
		canOpenSource,
		codingAgentInfo,
		editorInfo,
		openInCodingAgent,
		openInEditor,
		openSource,
		originalLocation,
	} = useOpenSequenceInApps(s);
	const validatedLocation = useMemo(() => {
		if (
			!originalLocation ||
			!originalLocation.source ||
			!originalLocation.line
		) {
			return null;
		}

		return {
			source: originalLocation.source,
			line: originalLocation.line,
			column: originalLocation.column ?? 0,
		};
	}, [originalLocation]);

	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const dragOverrides = Internals.useDragOverridesForNodePath(nodePath);
	const propStatusesForOverride = useMemo(() => {
		return nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
	}, [propStatuses, nodePath]);
	const volumeDragOverride = dragOverrides.volume;
	const waveformVolume = useMemo(() => {
		if (volumeDragOverride?.type === 'static') {
			return typeof volumeDragOverride.value === 'number'
				? volumeDragOverride.value
				: null;
		}

		if (volumeDragOverride?.type === 'keyframed') {
			return volumeDragOverride.status;
		}

		const volumeStatus = propStatusesForOverride?.volume;
		if (volumeStatus?.status === 'static') {
			return typeof volumeStatus.codeValue === 'number'
				? volumeStatus.codeValue
				: null;
		}

		return volumeStatus?.status === 'keyframed' ? volumeStatus : null;
	}, [propStatusesForOverride?.volume, volumeDragOverride]);
	const durationCanUpdate = Boolean(
		isStudioInteractivityEnabled() &&
		propStatusesForOverride?.durationInFrames?.status === 'static',
	);
	// Read the original rate before calculateTimeline applies ancestor rates.
	const endField = useRuntimeValueSelector({
		controls: s.controls,
		selector: (runtimeValues) =>
			getTimelineSequenceEndField({
				sequence: originalSequence ?? s,
				runtimeValues,
			}),
		isEqual: (first, second) =>
			first.fieldKey === second.fieldKey &&
			first.trimBefore === second.trimBefore &&
			first.playbackRate === second.playbackRate,
	});
	const durationCanResize = Boolean(
		isStudioInteractivityEnabled() &&
		canResizeTimelineSequenceDuration({
			status: propStatusesForOverride?.[endField.fieldKey],
		}),
	);
	const fromCanUpdate = Boolean(
		isStudioInteractivityEnabled() &&
		propStatusesForOverride?.from?.status === 'static',
	);
	const trimBeforeCanUpdate = Boolean(
		isStudioInteractivityEnabled() &&
		propStatusesForOverride?.trimBefore?.status === 'static',
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const showPremountingSetting = getStudioShowPremounting();
	const premountSelected = useIsPremountingSelected(
		showPremountingSetting ? null : nodePathInfo,
	);
	const showPremounting = showPremountingSetting || premountSelected;
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && isStudioInteractivityEnabled();
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const selectAsset = useSelectAsset();
	const getAssetContextMenu = useAssetTimelineContextMenu();
	const selectComposition = useSelectComposition();
	const confirm = useConfirmationDialog();
	const deleteTimelineItems = useDeleteTimelineItems();
	const {onSelect, selectable, selected, selectedItems} =
		useTimelineRowSelection(nodePathInfo);
	const selectedSequenceNodePathInfos = useMemo(() => {
		if (
			!selected ||
			selectedItems.length < 2 ||
			selectedItems.some((item) => item.type !== 'sequence')
		) {
			return null;
		}

		return selectedItems.flatMap((item) =>
			item.type === 'sequence' ? [item.nodePathInfo] : [],
		);
	}, [selected, selectedItems]);
	const performSequenceDoubleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isTimelineSelectionModifierEvent(e)) {
				e.stopPropagation();
				return;
			}

			const action = getSequenceDoubleClickAction({
				button: e.button,
				canOpenSource,
				numberOfConnectedCompositions: connectedCompositions.length,
				sequenceWasDragged:
					dragAwareDoubleClick.consumePointerGestureWasDragged(),
			});
			if (action === null) {
				return;
			}

			e.stopPropagation();
			if (action === 'open-connected-composition') {
				const timelinePosition = getCurrentFrame();
				selectComposition(
					connectedCompositions[0],
					true,
					getConnectedCompositionFrame({
						timelinePosition,
						sequence: s,
						sequenceFrameOffset,
					}),
				);
				return;
			}

			openSource();
		},
		[
			canOpenSource,
			connectedCompositions,
			dragAwareDoubleClick,
			openSource,
			s,
			selectComposition,
			sequenceFrameOffset,
		],
	);
	const onSequenceClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (dragAwareDoubleClick.consumePointerGestureWasDragged()) {
				return;
			}

			if (
				selectable &&
				e.button === 0 &&
				!isTimelineSelectionModifierEvent(e)
			) {
				onSelect();
			}

			if (!dragAwareDoubleClick.acceptClickAsDoubleClick(e)) {
				return;
			}

			performSequenceDoubleClick(e);
		},
		[dragAwareDoubleClick, onSelect, performSequenceDoubleClick, selectable],
	);
	const canDeleteFromSource = Boolean(nodePath && validatedLocation?.source);
	const deleteDisabled =
		!previewInteractive || !s.controls || !canDeleteFromSource;
	const isProgrammaticallyDuplicated =
		(nodePathInfo?.numberOfSequencesWithThisNodePath ?? 1) > 1;
	const duplicateDisabled = deleteDisabled || isProgrammaticallyDuplicated;
	const disableInteractivityDisabled =
		!previewInteractive ||
		!s.showInTimeline ||
		!nodePath ||
		!validatedLocation?.source;
	const mediaSrc =
		s.type === 'audio' || s.type === 'video' || s.type === 'image'
			? s.src
			: null;
	const onDuplicateSequenceFromSource = useCallback(() => {
		if (!validatedLocation?.source || !nodePathInfo || duplicateDisabled) {
			return;
		}

		duplicateSequencesFromSource([nodePathInfo], confirm).catch(
			() => undefined,
		);
	}, [confirm, duplicateDisabled, nodePathInfo, validatedLocation?.source]);
	const onDuplicateSelectedSequences = useCallback(() => {
		if (!previewInteractive || selectedSequenceNodePathInfos === null) {
			return;
		}

		duplicateSequencesFromSource(selectedSequenceNodePathInfos, confirm).catch(
			() => undefined,
		);
	}, [confirm, previewInteractive, selectedSequenceNodePathInfos]);
	const onSplitSelectedSequences = useCallback(() => {
		if (!previewInteractive || selectedSequenceNodePathInfos === null) {
			return;
		}

		splitSelectedTimelineItems({
			selections: selectedItems,
			tracks: calculateTimeline({
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
			}).tracks,
			propStatuses,
			splitFrame: getCurrentFrame(),
		})?.catch(() => undefined);
	}, [
		calculateTimeline,
		overrideIdToNodePathMappingsRef,
		previewInteractive,
		propStatuses,
		selectedItems,
		selectedSequenceNodePathInfos,
		sequencesRef,
	]);
	const onDeleteSequenceFromSource = useCallback(() => {
		if (
			!validatedLocation?.source ||
			!nodePath ||
			!nodePathInfo ||
			deleteDisabled
		) {
			return;
		}

		deleteTimelineItems([{type: 'sequence', nodePathInfo}]);
	}, [
		deleteDisabled,
		deleteTimelineItems,
		nodePath,
		nodePathInfo,
		validatedLocation?.source,
	]);
	const onDeleteSelectedSequences = useCallback(() => {
		if (!previewInteractive || selectedSequenceNodePathInfos === null) {
			return;
		}

		deleteTimelineItems(
			selectedSequenceNodePathInfos.map((selectedNodePathInfo) => ({
				type: 'sequence',
				nodePathInfo: selectedNodePathInfo,
			})),
		);
	}, [deleteTimelineItems, previewInteractive, selectedSequenceNodePathInfos]);
	const onDisableSequenceInteractivity = useCallback(() => {
		if (
			disableInteractivityDisabled ||
			!nodePath ||
			!validatedLocation?.source ||
			previewServerState.type !== 'connected'
		) {
			return;
		}

		disableSequenceInteractivity({
			fileName: validatedLocation.source,
			nodePath,
			setPropStatuses,
			clientId: previewServerState.clientId,
		});
	}, [
		disableInteractivityDisabled,
		nodePath,
		previewServerState,
		setPropStatuses,
		validatedLocation?.source,
	]);
	const getContextMenuItems = useCallback(
		(event: MouseEvent) => {
			const contextMenuTarget =
				event.target instanceof Element
					? event.target.closest<HTMLElement>(`[${TIMELINE_MARQUEE_ITEM_ATTR}]`)
					: null;
			const assetContextMenu = getAssetContextMenu();
			if (assetContextMenu !== null) {
				return assetContextMenu;
			}

			if (selectable && !selected) {
				onSelect({shiftKey: false, toggleKey: false});
			}

			if (selectedSequenceNodePathInfos !== null) {
				return getMultiSequenceContextMenuItems({
					selectedItemCount: selectedSequenceNodePathInfos.length,
					getContextForAgents: () =>
						getSequencesContextForAgents({
							nodePathInfos: selectedSequenceNodePathInfos,
							tracks: calculateTimeline({
								sequences: sequencesRef.current,
								overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
							}).tracks,
						}),
					deleteDisabled: !previewInteractive,
					duplicateDisabled: !previewInteractive,
					splitDisabled: !previewInteractive,
					onDeleteSelectedSequences,
					onDuplicateSelectedSequences,
					onSplitSelectedSequences,
				});
			}

			const {canvasContent} = compositionManagerRef.current;
			const unwrapMenuItem = getSequenceUnwrapMenuItem({
				sequence: s,
				sourceLocation: validatedLocation,
				setSelectedModal,
				canEditSource: previewInteractive && Boolean(validatedLocation?.source),
				compositionId:
					canvasContent?.type === 'composition'
						? canvasContent.compositionId
						: null,
				isTransition: s.timelineTrack?.role === 'transition',
				nodePath,
			});

			const splitMenuItem = getSequenceSplitMenuItem({
				nodePathInfo,
				sequence: s,
				propStatuses: propStatusesForOverride,
				splitFrame: getCurrentFrame(),
				keyframeDisplayOffset,
				keyframePlaybackRate,
				canEditSource: previewInteractive && Boolean(validatedLocation?.source),
				hasMultipleSelection: selected && selectedItems.length > 1,
			});

			const freezeFrameMenuItem = getSequenceFreezeFrameMenuItem({
				clientId:
					previewInteractive && previewServerState.type === 'connected'
						? previewServerState.clientId
						: null,
				nodePath,
				propStatusesForOverride,
				sequence: s,
				sequenceFrameOffset,
				setPropStatuses,
				timelinePosition: getCurrentFrame(),
				validatedSource: validatedLocation?.source ?? null,
			});

			return getSequenceContextMenuItems(
				{
					assetLinkInfo: mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null,
					canOpenInEditor,
					codingAgentInfo,
					copyImageElement: null,
					deleteDisabled,
					disableInteractivityDisabled,
					duplicateDisabled,
					editorInfo,
					includeSourceEditItems: isStudioInteractivityEnabled(),
					isProgrammaticallyDuplicated,
					onConfigureApps: canConfigureApps
						? () => {
								setSelectedModal({
									type: 'settings',
									initialStudioPane: null,
									initialTab: 'apps',
									initialPublicLicenseKey:
										window.remotion_renderDefaults?.publicLicenseKey ?? null,
								});
							}
						: null,
					onDeleteSequenceFromSource,
					onDisableSequenceInteractivity,
					onDuplicateSequenceFromSource,
					openInCodingAgent,
					openInEditor,
					originalLocation,
					selectAsset,
					sequence: s,
					sourceActions: isStudioInteractivityEnabled()
						? {
								rename: null,
								timing: [
									...(splitMenuItem ? [splitMenuItem] : []),
									...(freezeFrameMenuItem ? [freezeFrameMenuItem] : []),
								],
								appearance: [],
								unwrap: unwrapMenuItem,
							}
						: null,
				},
				contextMenuTarget,
			);
		},
		[
			getAssetContextMenu,
			compositionManagerRef,
			canOpenInEditor,
			canConfigureApps,
			codingAgentInfo,
			deleteDisabled,
			disableInteractivityDisabled,
			duplicateDisabled,
			editorInfo,
			isProgrammaticallyDuplicated,
			keyframeDisplayOffset,
			keyframePlaybackRate,
			mediaSrc,
			nodePath,
			nodePathInfo,
			onSelect,
			onDeleteSequenceFromSource,
			onDeleteSelectedSequences,
			onDisableSequenceInteractivity,
			onDuplicateSequenceFromSource,
			onDuplicateSelectedSequences,
			onSplitSelectedSequences,
			openInCodingAgent,
			openInEditor,
			originalLocation,
			calculateTimeline,
			overrideIdToNodePathMappingsRef,
			previewInteractive,
			previewServerState,
			propStatusesForOverride,
			s,
			selectAsset,
			selectable,
			selected,
			selectedItems.length,
			selectedSequenceNodePathInfos,
			sequenceFrameOffset,
			sequencesRef,
			setPropStatuses,
			setSelectedModal,
			validatedLocation,
		],
	);
	const {frozenFrame} = s;

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const displayDurationInFrames = s.loopDisplay
		? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
		: s.duration;
	const timelineVolume = useMemo(() => {
		if (typeof waveformVolume === 'number' && Number.isFinite(waveformVolume)) {
			return {type: 'constant' as const, value: Math.max(0, waveformVolume)};
		}

		return getTimelineVolume({
			status: typeof waveformVolume === 'number' ? null : waveformVolume,
			displayDurationInFrames,
			firstDisplayFrame: s.from + (s.loopDisplay?.startOffset ?? 0),
			keyframeDisplayOffset,
			keyframePlaybackRate,
		});
	}, [
		displayDurationInFrames,
		keyframeDisplayOffset,
		keyframePlaybackRate,
		s.from,
		s.loopDisplay?.startOffset,
		waveformVolume,
	]);

	const isMedia = s.type === 'audio' || s.type === 'video';
	const durationInFramesCodeValue =
		propStatusesForOverride?.durationInFrames?.status === 'static'
			? propStatusesForOverride.durationInFrames.codeValue
			: null;
	const explicitDurationInFrames =
		typeof durationInFramesCodeValue === 'number' &&
		Number.isFinite(durationInFramesCodeValue)
			? durationInFramesCodeValue
			: null;
	const mediaDurationDragLimits = isMedia
		? getTimelineSequenceMediaDurationDragLimits({
				cascadedStart,
				displayDurationInFrames: s.duration,
				displayStart: s.from,
				effectiveMaxMediaDuration,
				explicitDurationInFrames:
					explicitDurationInFrames === null
						? null
						: explicitDurationInFrames / s.playbackRate,
				naturalMediaDuration,
				timelineDurationInFrames: video.durationInFrames,
			})
		: null;
	const mediaDurationDragSelectionKey = nodePathInfo
		? getTimelineSequenceSelectionKey(nodePathInfo)
		: null;
	useEffect(() => {
		if (
			mediaDurationDragLimitsRegistry === null ||
			mediaDurationDragSelectionKey === null ||
			!isMedia
		) {
			return;
		}

		const registry = mediaDurationDragLimitsRegistry.current;
		registry.set(mediaDurationDragSelectionKey, mediaDurationDragLimits);
		return () => {
			registry.delete(mediaDurationDragSelectionKey);
		};
	}, [
		isMedia,
		mediaDurationDragLimits,
		mediaDurationDragLimitsRegistry,
		mediaDurationDragSelectionKey,
	]);

	const showRightEdgeDragHandle =
		isTimelineSequenceDurationDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		durationCanResize &&
		(!isMedia || Boolean(s.loopDisplay) || mediaDurationDragLimits !== null);
	const leftTrimStatuses = isCascadingSequence(s)
		? [
				propStatusesForOverride?.durationInFrames,
				propStatusesForOverride?.trimBefore,
			]
		: [
				propStatusesForOverride?.from,
				propStatusesForOverride?.durationInFrames,
				propStatusesForOverride?.trimBefore,
			];
	const leftTrimBlockedReason =
		previewInteractive &&
		leftTrimStatuses.some((status) => status?.status === 'computed') &&
		leftTrimStatuses.every(
			(status) => status?.status === 'static' || status?.status === 'computed',
		)
			? ('Computed value' as const)
			: null;
	const sourceTrimBlockedReason =
		previewInteractive &&
		propStatusesForOverride?.trimBefore?.status === 'computed'
			? ('Computed value' as const)
			: null;
	const showLeftEdgeDragHandle =
		isTimelineSequenceLeftEdgeDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		((isCascadingSequence(s)
			? durationCanUpdate && trimBeforeCanUpdate
			: fromCanUpdate && durationCanUpdate && trimBeforeCanUpdate) ||
			leftTrimBlockedReason !== null);
	const canRoll = (previous: TSequence | null, next: TSequence | null) => {
		if (!previewInteractive || !previous || !next) return false;
		return [previous, next].every((sequence) => {
			const path = sequence.controls?.overrideId
				? overrideIdToNodePathMappingsRef.current[sequence.controls.overrideId]
				: null;
			const statuses = path
				? Internals.getPropStatusesCtx(propStatuses, path)
				: null;
			return Boolean(
				path &&
				!sequence.loopDisplay &&
				isTimelineSequenceDurationDraggable(sequence) &&
				sequence.frozenFrame === null &&
				(!('frozenMediaFrame' in sequence) ||
					sequence.frozenMediaFrame === null) &&
				statuses?.durationInFrames?.status === 'static' &&
				(sequence !== next ||
					(statuses.trimBefore?.status === 'static' &&
						(isCascadingSequence(sequence) ||
							statuses.from?.status === 'static'))),
			);
		});
	};

	const rollingEnabled = canRoll(
		transitionNeighbors?.previous ?? previousTouchingSequence,
		transitionNeighbors?.next ?? s,
	);
	const nextRollingEnabled = canRoll(s, nextTouchingSequence);
	const hasCaptionsSchema = Object.values(s.controls?.schema ?? {}).some(
		(field) => field.type === 'remotion-captions',
	);
	return {
		props,
		video,
		dragAwareDoubleClick,
		isEdgeDragging,
		showTrimOutline: activeHighlight?.showTrimOutline ?? false,
		activeEdgeHighlight,
		activeTrimEdge,
		isAtTrimLimit,
		onTrimLimitChange,
		naturalSequenceDuration,
		startLeftEdgeDrag,
		startRightEdgeDrag,
		endEdgeDrag,
		clearEdgeHighlight,
		rollingEnabled,
		nextRollingEnabled,
		extendVideoLastFrame,
		mediaStartFrame,
		mediaLoopStartFrame,
		naturalMediaDuration,
		maxMediaDuration,
		effectiveMaxMediaDuration,
		validatedLocation,
		nodePath,
		fromCanUpdate,
		trimBeforeCanUpdate,
		showPremounting,
		previewConnected,
		onSelect,
		selected,
		getContextMenuItems,
		frozenFrame,
		onSequenceClick,
		timelineVolume,
		displayDurationInFrames,
		mediaDurationDragLimits,
		hasCaptionsSchema,
		showRightEdgeDragHandle,
		showLeftEdgeDragHandle,
		leftTrimBlockedReason,
		sourceTrimBlockedReason,
		onPointerEnter,
	};
};

// Source metadata, selection and edit callbacks do not depend on timeline zoom.
// Keep this owner mounted when the clip is horizontally outside the viewport.
const TimelineSequenceInner: React.FC<TimelineSequenceProps> = (props) => {
	const state = useTimelineSequenceState(props);
	return <TimelineSequenceLayout state={state} />;
};

const TimelineSequenceLayout: React.FC<{
	readonly state: ReturnType<typeof useTimelineSequenceState>;
}> = ({state}) => {
	const windowWidth = useContext(TimelineWidthContext);
	if (windowWidth === null) {
		return null;
	}

	return (
		<TimelineSequenceLayoutInner state={state} windowWidth={windowWidth} />
	);
};

const TimelineSequenceLayoutInner: React.FC<{
	readonly state: ReturnType<typeof useTimelineSequenceState>;
	readonly windowWidth: number;
}> = ({state, windowWidth}) => {
	const {
		s,
		labelStartFrame,
		connectedCompositions,
		nodePathInfo,
		keyframePlaybackRate,
		sequenceFrameOffset,
		cascadedStart,
		localStart,
		parentVisibleStart,
		parentVisibleEnd,
	} = state.props;
	const {
		video,
		dragAwareDoubleClick,
		isEdgeDragging,
		showTrimOutline,
		activeEdgeHighlight,
		activeTrimEdge,
		isAtTrimLimit,
		onTrimLimitChange,
		naturalSequenceDuration,
		startLeftEdgeDrag,
		startRightEdgeDrag,
		endEdgeDrag,
		clearEdgeHighlight,
		rollingEnabled,
		nextRollingEnabled,
		extendVideoLastFrame,
		mediaStartFrame,
		mediaLoopStartFrame,
		naturalMediaDuration,
		maxMediaDuration,
		effectiveMaxMediaDuration,
		validatedLocation,
		nodePath,
		fromCanUpdate,
		trimBeforeCanUpdate,
		showPremounting,
		previewConnected,
		onSelect,
		selected,
		getContextMenuItems,
		frozenFrame,
		onSequenceClick,
		timelineVolume,
		displayDurationInFrames,
		mediaDurationDragLimits,
		hasCaptionsSchema,
		showRightEdgeDragHandle,
		showLeftEdgeDragHandle,
		leftTrimBlockedReason,
		sourceTrimBlockedReason,
		onPointerEnter,
	} = state;
	const isZooming = useContext(TimelineZoomActiveContext);
	const sceneRange = useContext(TimelineSceneRangeContext);
	const inheritedSceneRange = useContext(TimelineInheritedSceneRangeContext);
	const sceneClipHeight = useContext(TimelineSceneClipHeightContext);
	const renderWindow = useContext(TimelineViewportContext);
	const isMedia = s.type === 'audio' || s.type === 'video';

	const {onPointerDown: onMoveDragPointerDown} = useTimelineSequenceFromDrag({
		nodePathInfo,
		windowWidth,
		timelineDurationInFrames: video.durationInFrames,
		onDragEnd: dragAwareDoubleClick.endPointerGesture,
	});

	const {
		marginLeft,
		width,
		negativeStartWidth,
		negativeStartClipped,
		premountWidth,
		postmountWidth,
	} = useMemo(() => {
		return getTimelineSequenceLayout({
			durationInFrames: displayDurationInFrames,
			startFrom: s.loopDisplay ? s.from + s.loopDisplay.startOffset : s.from,
			cascadedStart,
			// The media duration cap already accounts for trimming and playback speed.
			startFromMedia: 0,
			maxMediaDuration: effectiveMaxMediaDuration,
			video,
			windowWidth,
			// Premounting does not occupy space in a packed track.
			premountDisplay:
				s.timelineTrack || !showPremounting ? null : s.premountDisplay,
			postmountDisplay: s.postmountDisplay,
		});
	}, [
		cascadedStart,
		displayDurationInFrames,
		effectiveMaxMediaDuration,
		s,
		showPremounting,
		video,
		windowWidth,
	]);
	const visibleLayout = useMemo(() => {
		if (renderWindow === null) {
			return null;
		}

		return getTimelineSequenceVisibleLayout({
			marginLeft,
			width,
			negativeStartWidth,
			premountWidth: premountWidth ?? 0,
			postmountWidth: postmountWidth ?? 0,
			renderWindowLeft: renderWindow.left - TIMELINE_PADDING,
			renderWindowWidth: renderWindow.width,
		});
	}, [
		marginLeft,
		negativeStartWidth,
		postmountWidth,
		premountWidth,
		renderWindow,
		width,
	]);
	const mediaVisualizationStyle = useMemo((): React.CSSProperties => {
		return {
			width: visibleLayout?.media?.width ?? 0,
			marginLeft: visibleLayout?.media?.left ?? 0,
			height: hasTimelineTrackMediaLabel(s)
				? getTimelineLayerHeight(s.type)
				: '100%',
		};
	}, [s, visibleLayout]);
	useLayoutEffect(() => {
		if (
			(maxMediaDuration === null && !s.loopDisplay) ||
			visibleLayout === null
		) {
			return;
		}

		const layouts = timelineLayerLayoutsRef.current;
		layouts.set(s.id, visibleLayout);
		return () => {
			layouts.delete(s.id);
		};
	}, [maxMediaDuration, s.id, s.loopDisplay, visibleLayout]);
	const marqueeHorizontalBounds = useMemo(
		() => ({cropLeft: visibleLayout?.cropLeft ?? 0, width}),
		[visibleLayout?.cropLeft, width],
	);
	const showLeftBorderRadius =
		visibleLayout?.leftEdgeVisible === true &&
		localStart >= 0 &&
		(s.trimBefore ?? 0) === 0 &&
		(s.type === 'sequence' ||
			s.type === 'image' ||
			getTimelineMediaStartFrame({
				startMediaFrom: s.startMediaFrom,
				mediaFrameAtSequenceZero: s.mediaFrameAtSequenceZero,
				sequenceFrameOffset,
				playbackRate: s.playbackRate,
			}) === 0);

	// Compare frame boundaries: fractional media durations still occupy the last frame.
	const endsAtNaturalMediaDuration =
		!s.loopDisplay &&
		s.frozenFrame === null &&
		(s.type === 'audio' || s.type === 'video') &&
		s.frozenMediaFrame === null &&
		naturalMediaDuration !== null &&
		Number.isFinite(naturalMediaDuration) &&
		naturalMediaDuration > 0 &&
		Math.ceil(
			Math.min(
				s.duration,
				video.durationInFrames - s.from,
				maxMediaDuration ?? Infinity,
			),
		) === Math.ceil(naturalMediaDuration);

	const parentStart = parentVisibleStart;
	const parentEnd = parentVisibleEnd ?? video.durationInFrames;
	const frameIncrement =
		(windowWidth - TIMELINE_PADDING * 2) / video.durationInFrames;
	const outgoingTransitionStart = isTransitionSeriesSequence(s)
		? (sceneRange?.transitionOutStart ?? null)
		: null;
	const transitionStartOffset =
		outgoingTransitionStart !== null && visibleLayout !== null
			? Math.round(outgoingTransitionStart * frameIncrement) -
				visibleLayout.marginLeft
			: null;
	const rightTrimHandleVisible =
		transitionStartOffset !== null
			? transitionStartOffset >= 0 &&
				transitionStartOffset <= (visibleLayout?.width ?? 0)
			: visibleLayout?.rightEdgeVisible;
	const layerHeight = getTimelineSequenceHeight(s);
	const trimOutline = (() => {
		if (
			isZooming ||
			!isEdgeDragging ||
			!showTrimOutline ||
			activeEdgeHighlight === null ||
			s.loopDisplay ||
			s.frozenFrame !== null ||
			!Number.isFinite(frameIncrement) ||
			frameIncrement <= 0
		) {
			return null;
		}

		if (isMedia && s.frozenMediaFrame !== null) {
			return null;
		}

		const trimmedBefore = Math.max(
			0,
			isMedia
				? mediaStartFrame / (s.playbackRate * s.sequencePlaybackRate)
				: (s.trimBefore ?? 0) / s.sequencePlaybackRate,
		);
		const trimmedAfter =
			isMedia &&
			naturalMediaDuration !== null &&
			Number.isFinite(naturalMediaDuration)
				? Math.max(0, naturalMediaDuration - displayDurationInFrames)
				: naturalSequenceDuration !== null
					? Math.max(
							0,
							cascadedStart +
								naturalSequenceDuration / keyframePlaybackRate -
								s.from -
								displayDurationInFrames,
						)
					: 0;
		if (!Number.isFinite(trimmedBefore)) {
			return null;
		}

		if (trimmedBefore < 0.5 && trimmedAfter < 0.5) {
			return null;
		}

		// Source-only edits can use footage outside the parent's visible interval.
		const isSourceOnly = activeEdgeHighlight === 'source-only';
		const start = Math.max(
			isSourceOnly ? 0 : parentStart,
			0,
			s.from - trimmedBefore,
		);
		const end = Math.min(
			isSourceOnly ? video.durationInFrames : parentEnd,
			video.durationInFrames,
			s.from + displayDurationInFrames + trimmedAfter,
		);
		const leftWidth = Math.max(0, s.from - start) * frameIncrement;
		const rightStart = s.from + displayDurationInFrames;
		const rightWidth = Math.max(0, end - rightStart) * frameIncrement;
		if (leftWidth === 0 && rightWidth === 0) {
			return null;
		}

		const isPackedClip =
			s.timelineTrack?.role === 'clip' && s.timelineTrack.seriesOffset !== null;
		const outlineShapes = [
			{key: 'sequence', range: sceneRange, packed: isPackedClip},
			{
				key: 'inherited',
				range: inheritedSceneRange === sceneRange ? null : inheritedSceneRange,
				packed: false,
			},
		].flatMap(({key, range, packed}) => {
			if (
				isSourceOnly ||
				range === null ||
				(range.transitionInEnd === null && range.transitionOutStart === null)
			) {
				return [];
			}

			const shape = getTimelineSceneShape(
				{
					// A packed clip can extend to its trim limits, while a parent's
					// transition continues to constrain the shape of its children.
					sceneRange: packed
						? {
								...range,
								from: start,
								end,
								transitionInEnd:
									range.transitionInEnd === null
										? null
										: start + (range.transitionInEnd - range.from),
								transitionOutStart:
									range.transitionOutStart === null
										? null
										: end - (range.end - range.transitionOutStart),
							}
						: range,
					offsetInFrames: start,
					durationInFrames: end - start,
					pixelsPerFrame: frameIncrement,
					height: packed ? layerHeight : (sceneClipHeight ?? layerHeight),
					seamY: packed ? layerHeight / 2 : TIMELINE_CHILD_TRANSITION_SEAM_Y,
					transitionCutout: packed
						? {
								top: transitionVerticalInset,
								height: transitionHeight,
								radius: 4,
								minWidth: minTransitionAreaWidth,
							}
						: null,
					cropHeight: layerHeight,
				},
				true,
			);
			return shape === null ? [] : [{key, shape}];
		});
		const outlineBorder = outlineShapes.length > 0 ? 0 : `2px solid ${WHITE}`;

		const outline = (
			<>
				{[
					{edge: 'left', from: start, width: leftWidth},
					{edge: 'right', from: rightStart, width: rightWidth},
				].map(({edge, from, width: outlineWidth}) =>
					outlineWidth > 0 ? (
						<div
							key={edge}
							aria-hidden="true"
							data-timeline-trim-outline={edge}
							style={{
								position: 'absolute',
								left: from * frameIncrement,
								width: outlineWidth,
								height: layerHeight,
								zIndex: s.timelineTrack ? 1 : undefined,
								borderTop: outlineBorder,
								borderBottom: outlineBorder,
								borderLeft: edge === 'left' ? outlineBorder : 0,
								borderRight: edge === 'right' ? outlineBorder : 0,
								borderRadius: edge === 'left' ? '2px 0 0 2px' : '0 2px 2px 0',
								overflow: 'hidden',
								pointerEvents: 'none',
							}}
						>
							{outlineShapes.length > 0 ? (
								<div
									style={{
										position: 'absolute',
										left: (start - from) * frameIncrement,
										width: (end - start) * frameIncrement,
										height: layerHeight,
										clipPath: outlineShapes[0].shape.clipPath,
									}}
								>
									{outlineShapes.map(({key, shape}) => (
										<svg
											key={key}
											style={{
												position: 'absolute',
												inset: 0,
												width: '100%',
												height: '100%',
												clipPath: shape.clipPath,
											}}
										>
											<path
												d={shape.path}
												fill="none"
												stroke={WHITE}
												strokeWidth={4}
												strokeLinejoin="round"
												vectorEffect="non-scaling-stroke"
											/>
										</svg>
									))}
								</div>
							) : null}
						</div>
					) : null,
				)}
			</>
		);
		return isSourceOnly ? (
			<TimelineUnclippedTrimContent>{outline}</TimelineUnclippedTrimContent>
		) : (
			outline
		);
	})();
	const endsAtContainerBoundary =
		Math.ceil(s.from + displayDurationInFrames) >=
		Math.ceil(Math.min(parentEnd, video.durationInFrames));

	const showRightBorderRadius =
		visibleLayout?.rightEdgeVisible === true &&
		(s.autoDuration || endsAtContainerBoundary || endsAtNaturalMediaDuration);

	const isTransitionClip = isTransitionSeriesSequence(s);
	const style: React.CSSProperties = useMemo(() => {
		const role = s.timelineTrack?.role;
		return {
			background:
				role === 'transition'
					? TRANSPARENT
					: s.type === 'audio'
						? TIMELINE_AUDIO_GRADIENT
						: s.type === 'video'
							? TIMELINE_VIDEO_GRADIENT
							: hasCaptionsSchema
								? TIMELINE_CAPTIONS_GRADIENT
								: BLUE,
			borderTopLeftRadius: showLeftBorderRadius ? 2 : 0,
			borderBottomLeftRadius: showLeftBorderRadius ? 2 : 0,
			borderTopRightRadius: showRightBorderRadius ? 2 : 0,
			borderBottomRightRadius: showRightBorderRadius ? 2 : 0,
			position: 'absolute',
			// Transition clip handles share the track's stacking context so the next
			// clip and the transition overlay cannot cover a trim edge.
			isolation: s.timelineTrack && !isTransitionClip ? 'isolate' : undefined,
			zIndex: rollingEnabled && !isTransitionClip ? 2 : undefined,
			height: layerHeight,
			top: s.timelineTrack ? 0 : undefined,
			marginLeft: visibleLayout?.marginLeft ?? 0,
			width: visibleLayout?.width ?? 0,
			color: WHITE,
			// Edge handles extend outside the layer; media is clipped separately.
			overflow: 'visible',
		};
	}, [
		hasCaptionsSchema,
		isTransitionClip,
		s.type,
		s.timelineTrack,
		rollingEnabled,
		showLeftBorderRadius,
		showRightBorderRadius,
		visibleLayout,
		layerHeight,
	]);

	const canShowSecondaryLeftEdgeAction =
		!isTransitionSeriesSequence(s) &&
		isMedia &&
		isTimelineSequenceLeftEdgeDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		(trimBeforeCanUpdate || sourceTrimBlockedReason !== null);
	const secondaryLeftEdgeAction = canShowSecondaryLeftEdgeAction
		? 'source-only'
		: null;

	if ((maxMediaDuration === null && !s.loopDisplay) || visibleLayout === null) {
		return trimOutline;
	}

	const showLeftActions = Boolean(
		(showLeftEdgeDragHandle ||
			secondaryLeftEdgeAction ||
			(s.timelineTrack?.role === 'transition' && rollingEnabled)) &&
		(s.timelineTrack?.role === 'transition' ||
			visibleLayout.media?.offset === 0) &&
		nodePathInfo &&
		validatedLocation,
	);
	const leftTrimEnabled =
		s.timelineTrack?.role !== 'transition' &&
		showLeftEdgeDragHandle &&
		visibleLayout.media?.offset === 0;
	const showRightActions = Boolean(
		s.timelineTrack?.role !== 'transition' &&
		showRightEdgeDragHandle &&
		rightTrimHandleVisible &&
		nodePathInfo &&
		validatedLocation,
	);
	// The negative-time gutter is an indicator, not an editable clip boundary.
	const leftEdgeOffset =
		s.timelineTrack?.role === 'transition'
			? 0
			: (visibleLayout.media?.left ?? 0);
	const rightEdgeOffset = transitionStartOffset ?? visibleLayout.width;
	const trimHandleLayout = getTimelineTrimHandleLayout({
		leftEdge: leftEdgeOffset,
		rightEdge: rightEdgeOffset,
		rolling: showLeftActions && rollingEnabled,
		leftTrim: showLeftActions && leftTrimEnabled,
		secondary: showLeftActions && secondaryLeftEdgeAction !== null,
		rightTrim: showRightActions,
		nextRolling: nextRollingEnabled,
		activeEdge: isEdgeDragging ? activeEdgeHighlight : null,
	});

	const mediaDisplayOffsetInFrames = visibleLayout.media
		? visibleLayout.media.offset / frameIncrement
		: 0;
	const mediaDisplayDurationInFrames = visibleLayout.media
		? visibleLayout.media.width / frameIncrement
		: 0;

	const sequence = (
		<TimelineSequenceBar
			s={s}
			hasCaptionsSchema={hasCaptionsSchema}
			captionRange={
				hasCaptionsSchema
					? {
							// The source offset already includes this layer's trim and
							// clipping by ancestors, independent of viewport scrolling.
							startMs: (sequenceFrameOffset / video.fps) * 1000,
							endMs:
								((sequenceFrameOffset +
									Math.max(
										0,
										Math.min(s.duration, video.durationInFrames - s.from),
									) *
										s.sequencePlaybackRate) /
									video.fps) *
								1000,
						}
					: null
			}
			labelOffset={
				labelStartFrame === null
					? 0
					: Math.max(
							0,
							labelStartFrame * frameIncrement - visibleLayout.marginLeft,
						)
			}
			captionLabelBounds={
				hasCaptionsSchema
					? {
							// Anchor the transcript and its fade to the full media range.
							// The cropped render window must not restart the text.
							left:
								marginLeft +
								negativeStartWidth +
								(premountWidth ?? 0) -
								visibleLayout.marginLeft,
							width:
								width -
								negativeStartWidth -
								(premountWidth ?? 0) -
								(postmountWidth ?? 0),
						}
					: null
			}
			connectedComposition={connectedCompositions[0] ?? null}
			activeTrimEdge={activeTrimEdge}
			isAtTrimLimit={isAtTrimLimit}
			leftTrimHighlight={
				visibleLayout.media?.offset === 0 ? visibleLayout.media : null
			}
			displayDurationInFrames={displayDurationInFrames}
			selectionBounds={visibleLayout.media}
			premount={visibleLayout.premount}
			showPremounting={showPremounting}
			postmount={visibleLayout.postmount}
			negativeStart={visibleLayout.negativeStart}
			leftEdgeVisible={visibleLayout.leftEdgeVisible}
			rightEdgeVisible={visibleLayout.rightEdgeVisible}
			negativeStartClipped={negativeStartClipped}
			style={style}
			marqueeHorizontalBounds={marqueeHorizontalBounds}
			nodePathInfo={nodePathInfo}
			sequenceFrameOffset={sequenceFrameOffset}
			fromCanUpdate={fromCanUpdate}
			frozenFrame={frozenFrame}
			onMoveDragPointerDown={onMoveDragPointerDown}
			onPointerDownCapture={dragAwareDoubleClick.beginPointerGesture}
			onPointerEnter={onPointerEnter}
			onClick={onSequenceClick}
			edgeDragHandles={
				isZooming && !isEdgeDragging ? null : (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							pointerEvents: 'none',
							zIndex: 2,
						}}
					>
						{showLeftActions && nodePathInfo ? (
							<TimelineSequenceLeftEdgeDragHandle
								// Transition targets keep the default cursor, including during rolling edits.
								cursor={
									s.timelineTrack?.role === 'transition'
										? 'default'
										: `${timelineTrimEdgeCursor}, ew-resize`
								}
								trimBeforeCursor={`${timelineLeftEdgeCursor}, e-resize`}
								sourceOnlyCursor={`${timelineSourceOnlyCursor}, ew-resize`}
								edgeEnabled={leftTrimEnabled}
								edgeBlockedReason={leftTrimBlockedReason}
								sourceTrimBlockedReason={sourceTrimBlockedReason}
								handleLayout={trimHandleLayout}
								edgeOffset={leftEdgeOffset}
								edgeMode={
									isTransitionSeriesSequence(s) ? 'head-trim' : 'self-trim'
								}
								rollingEnabled={rollingEnabled}
								fillTarget={s.timelineTrack?.role === 'transition'}
								isTransitionSeries={
									isTransitionSeriesSequence(s) ||
									s.timelineTrack?.role === 'transition'
								}
								onHoverEnd={clearEdgeHighlight}
								secondaryAction={secondaryLeftEdgeAction}
								nodePathInfo={nodePathInfo}
								windowWidth={windowWidth}
								timelineDurationInFrames={video.durationInFrames ?? 1}
								initialEdgeFrame={
									s.from +
									(s.timelineTrack?.role === 'transition' ? s.duration / 2 : 0)
								}
								fps={video.fps}
								onDragStart={startLeftEdgeDrag}
								onDragEnd={endEdgeDrag}
								onLimitChange={onTrimLimitChange}
								onSelect={onSelect}
								selected={selected}
							/>
						) : null}
						{showRightActions &&
						trimHandleLayout.rightTrim !== null &&
						nodePathInfo ? (
							<TimelineSequenceRightEdgeDragHandle
								isTransitionSeries={isTransitionSeriesSequence(s)}
								handleLeft={trimHandleLayout.rightTrim!}
								edgeOffset={rightEdgeOffset}
								onHoverEnd={clearEdgeHighlight}
								cursor={`${timelineRightEdgeCursor}, ew-resize`}
								nodePathInfo={nodePathInfo}
								mediaDurationDragLimits={mediaDurationDragLimits}
								windowWidth={windowWidth}
								timelineDurationInFrames={video.durationInFrames ?? 1}
								initialEdgeFrame={
									outgoingTransitionStart ??
									s.from +
										Math.max(
											0,
											Math.min(
												displayDurationInFrames,
												effectiveMaxMediaDuration ?? Infinity,
												video.durationInFrames - s.from,
											),
										)
								}
								fps={video.fps}
								onDragStart={startRightEdgeDrag}
								onDragEnd={endEdgeDrag}
								onLimitChange={onTrimLimitChange}
								onSelect={onSelect}
								selected={selected}
							/>
						) : null}
					</div>
				)
			}
		>
			{s.type === 'audio' && visibleLayout.media ? (
				<div style={mediaVisualizationStyle}>
					<AudioWaveform
						src={s.src}
						height={TIMELINE_LAYER_HEIGHT_AUDIO}
						muted={s.muted}
						visualizationWidth={visibleLayout.media.width}
						startFrom={mediaLoopStartFrame}
						durationInFrames={s.duration}
						displayOffsetInFrames={mediaDisplayOffsetInFrames}
						displayDurationInFrames={mediaDisplayDurationInFrames}
						volume={timelineVolume}
						playbackRate={s.playbackRate * s.sequencePlaybackRate}
						loopDisplay={s.loopDisplay}
						loopDisplayOffsetInFrames={s.loopDisplay?.phaseOffsetInFrames ?? 0}
					/>
				</div>
			) : null}
			{s.type === 'video' && visibleLayout.media ? (
				<div
					style={{
						height: hasTimelineTrackMediaLabel(s)
							? getTimelineLayerHeight(s.type)
							: '100%',
					}}
				>
					<TimelineVideoInfo
						src={s.src}
						visualizationWidth={visibleLayout.media.width}
						displayOffsetInFrames={mediaDisplayOffsetInFrames}
						displayDurationInFrames={mediaDisplayDurationInFrames}
						startMediaFrom={s.startMediaFrom}
						mediaFrameAtSequenceZero={mediaLoopStartFrame}
						sequenceFrameOffset={0}
						playbackRate={s.playbackRate * s.sequencePlaybackRate}
						volume={timelineVolume}
						muted={s.muted}
						marginLeft={visibleLayout.media.left}
						loopDisplay={s.loopDisplay}
						loopDisplayOffsetInFrames={s.loopDisplay?.phaseOffsetInFrames ?? 0}
						frozenMediaFrame={s.frozenMediaFrame}
						extendLastFrame={extendVideoLastFrame}
					/>
				</div>
			) : null}
			{s.type === 'image' && visibleLayout.media ? (
				<div style={mediaVisualizationStyle}>
					<TimelineImageInfo
						src={s.src}
						offsetInPixels={visibleLayout.media.offset}
					/>
				</div>
			) : null}
			{s.loopDisplay === undefined ? null : (
				<LoopedTimelineIndicator
					loops={s.loopDisplay.numberOfTimes}
					phase={
						s.loopDisplay.phaseOffsetInFrames / s.loopDisplay.durationInFrames
					}
					fullWidth={width}
					visibleOffset={visibleLayout.cropLeft}
					visibleWidth={visibleLayout.width}
				/>
			)}
		</TimelineSequenceBar>
	);

	return (
		<>
			{trimOutline}
			{previewConnected || window.remotion_isReadOnlyStudio ? (
				<ContextMenu getItems={getContextMenuItems}>{sequence}</ContextMenu>
			) : (
				sequence
			)}
		</>
	);
};

export const TimelineSequence = React.memo(TimelineSequenceInner);
