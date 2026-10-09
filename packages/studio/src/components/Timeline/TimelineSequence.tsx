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
	ResolvedStackLocation,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BLACK_ALPHA_22,
	BLUE,
	TIMELINE_AUDIO_GRADIENT,
	TIMELINE_BACKGROUND_COLOR,
	TIMELINE_NEGATIVE_START_BACKGROUND_COLOR,
	TIMELINE_NEGATIVE_START_BORDER_COLOR,
	TIMELINE_VIDEO_GRADIENT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_15,
	WHITE_ALPHA_20,
} from '../../helpers/colors';
import {createDragAwareDoubleClickTracker} from '../../helpers/drag-aware-double-click';
import {
	getConnectedCompositionFrame,
	getSequenceDoubleClickAction,
} from '../../helpers/get-sequence-double-click-action';
import {getTimelineSequenceLayout} from '../../helpers/get-timeline-sequence-layout';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {isVideoWithLastFrameHold} from '../../helpers/is-video-with-last-frame-hold';
import {getSequenceAnnotationAttributes} from '../../helpers/sequence-annotation';
import {getStudioShowPremounting} from '../../helpers/studio-runtime-config';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LAYER_HEIGHT_AUDIO,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {useMediaMetadata} from '../../helpers/use-media-metadata';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {SnowflakeIcon} from '../../icons/snowflake';
import {SetSelectedModalContext} from '../../state/modals';
import {ActionTooltip} from '../ActionTooltip';
import {AudioWaveform} from '../AudioWaveform';
import {CompositionOrStillIcon} from '../CompositionOrStillIcon';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {ContextMenu} from '../ContextMenu';
import {useSelectComposition} from '../InitialCompositionLoader';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {useSelectAsset} from '../use-select-asset';
import {disableSequenceInteractivity} from './disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {
	getMultiSequenceContextMenuItems,
	getSequenceContextMenuItems,
} from './get-sequence-context-menu-items';
import {getSequenceSplitMenuItem} from './get-sequence-split-menu-item';
import {getSequencesContextForAgents} from './get-sequences-context-for-agents';
import {
	getKeyframeDisplayOffset,
	getKeyframePlaybackRate,
} from './get-timeline-keyframes';
import {getTimelineMediaStartFrame} from './get-timeline-media-start-frame';
import {getTimelineSequenceVisibleLayout} from './get-timeline-sequence-visible-layout';
import {getCurrentFrame} from './imperative-state';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {splitSelectedTimelineItems} from './split-selected-timeline-item';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';
import {timelineLeftEdgeCursor} from './timeline-left-edge-cursor';
import {timelineLayerLayoutsRef} from './timeline-refs';
import {
	TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT,
	TIMELINE_PACKED_TRACK_HEIGHT,
} from './timeline-track-groups';
import {timelineTrimEdgeCursor} from './timeline-trim-edge-cursor';
import {TimelineImageInfo} from './TimelineImageInfo';
import {TimelineSceneRangeContext} from './TimelineSceneRangeContext';
import {
	getTimelineColor,
	getTimelineSequenceSelectionKey,
	isTimelineSelectionModifierEvent,
	shouldSelectTimelineRowOnPointerDown,
	TIMELINE_MARQUEE_ITEM_ATTR,
	useTimelineMarqueeSelectableItem,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';
import {TimelineSequenceMountIndicator} from './TimelineSequenceMountIndicator';
import {
	canResizeTimelineSequenceDuration,
	getTimelineSequenceEndField,
	getTimelineSequenceMediaDurationDragLimits,
	isCascadingSequence,
	isTimelineSequenceDurationDraggable,
	isTimelineSequenceLeftEdgeDraggable,
	TimelineSequenceLeftEdgeDragHandle,
	TimelineSequenceMediaDurationDragLimitsContext,
	TimelineSequenceRightEdgeDragHandle,
	useTimelineSequenceFromDrag,
} from './TimelineSequenceRightEdgeDragHandle';
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
const MIN_SECONDARY_LEFT_EDGE_ACTION_WIDTH = 32;
const PACKED_LABEL_HEIGHT = 15;
const PACKED_LABEL_BOTTOM = 1;

type TimelineEdgeHighlightEdge = 'left' | 'right' | 'source-only';

type TimelineEdgeHighlight = {
	readonly nodePathKey: string;
	readonly edge: TimelineEdgeHighlightEdge;
};

const TimelineEdgeHighlightContext = React.createContext<{
	readonly register: (
		nodePathKey: string,
		listener: React.Dispatch<
			React.SetStateAction<TimelineEdgeHighlightEdge | null>
		>,
	) => () => void;
	readonly setHighlights: (
		highlights: readonly TimelineEdgeHighlight[],
	) => void;
} | null>(null);

export const TimelineEdgeHighlightProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	// Keep the context value stable so highlighting boundaries does not re-render
	// every timeline sequence through a context broadcast.
	const value = useMemo(() => {
		let highlights = new Map<string, TimelineEdgeHighlightEdge>();
		const listeners = new Map<
			string,
			Set<
				React.Dispatch<React.SetStateAction<TimelineEdgeHighlightEdge | null>>
			>
		>();

		return {
			register: (
				nodePathKey: string,
				listener: React.Dispatch<
					React.SetStateAction<TimelineEdgeHighlightEdge | null>
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
						highlight.edge,
					]),
				);
				const changedNodePathKeys = new Set([
					...highlights.keys(),
					...nextHighlightMap.keys(),
				]);
				for (const nodePathKey of changedNodePathKeys) {
					const previousEdge = highlights.get(nodePathKey) ?? null;
					const nextEdge = nextHighlightMap.get(nodePathKey) ?? null;
					if (previousEdge !== nextEdge) {
						for (const listener of listeners.get(nodePathKey) ?? []) {
							listener(nextEdge);
						}
					}
				}

				highlights = nextHighlightMap;
			},
		};
	}, []);

	return (
		<TimelineEdgeHighlightContext.Provider value={value}>
			{children}
		</TimelineEdgeHighlightContext.Provider>
	);
};

const TimelineSequenceFn: React.FC<{
	readonly s: TimelineTrackData['sequence'];
	readonly labelStartFrame: number | null;
	readonly paintEndFrame: number | null;
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly sequenceFrameOffset: number;
	readonly cascadedStart: number;
	readonly localStart: number;
	readonly parentVisibleStart: number;
	readonly parentVisibleEnd: number | null;
}> = ({
	s,
	labelStartFrame,
	paintEndFrame,
	connectedCompositions,
	nodePathInfo,
	keyframeDisplayOffset,
	keyframePlaybackRate,
	sequenceFrameOffset,
	cascadedStart,
	localStart,
	parentVisibleStart,
	parentVisibleEnd,
}) => {
	const windowWidth = useContext(TimelineWidthContext);

	if (windowWidth === null) {
		return null;
	}

	return (
		<TimelineSequenceInner
			windowWidth={windowWidth}
			s={s}
			labelStartFrame={labelStartFrame}
			paintEndFrame={paintEndFrame}
			connectedCompositions={connectedCompositions}
			nodePathInfo={nodePathInfo}
			keyframeDisplayOffset={keyframeDisplayOffset}
			keyframePlaybackRate={keyframePlaybackRate}
			sequenceFrameOffset={sequenceFrameOffset}
			cascadedStart={cascadedStart}
			localStart={localStart}
			parentVisibleStart={parentVisibleStart}
			parentVisibleEnd={parentVisibleEnd}
		/>
	);
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
	readonly connectedComposition: _InternalTypes['AnyComposition'] | null;
	readonly annotationLocation: ResolvedStackLocation | null;
	readonly paintEndFrame: number | null;
	readonly activeTrimEdge: 'left' | 'right' | null;
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
	readonly onClick: React.MouseEventHandler<HTMLDivElement> | null;
}> = ({
	s,
	labelOffset,
	connectedComposition,
	activeTrimEdge,
	leftTrimHighlight,
	annotationLocation,
	paintEndFrame,
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
	onClick,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const sceneRange = useContext(TimelineSceneRangeContext);
	const timelineWidth = useContext(TimelineWidthContext);
	const video = Internals.useUnsafeVideoConfig();
	const {onSelect, selectable, selected, selectionItem} =
		useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	useTimelineMarqueeSelectableItem(selectionItem, ref, marqueeHorizontalBounds);

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button === 0) {
				e.stopPropagation();
				if (
					shouldSelectTimelineRowOnPointerDown({
						selected,
						shiftKey: e.shiftKey,
						metaKey: e.metaKey,
						ctrlKey: e.ctrlKey,
					})
				) {
					onSelect({
						shiftKey: e.shiftKey,
						toggleKey: e.metaKey || e.ctrlKey,
					});
				}

				if (fromCanUpdate) {
					onMoveDragPointerDown(e);
				}
			}
		},
		[fromCanUpdate, onMoveDragPointerDown, onSelect, selected],
	);
	const negativeStartEnd = negativeStart
		? negativeStart.left + negativeStart.width
		: 0;
	const transitionWidth =
		s.timelineTrack?.role === 'transition'
			? (marqueeHorizontalBounds?.width ?? Number(style.width))
			: null;
	const frameIncrement =
		timelineWidth !== null && video !== null
			? (timelineWidth - TIMELINE_PADDING * 2) / video.durationInFrames
			: null;
	const sceneLeft =
		sceneRange !== null && frameIncrement !== null
			? sceneRange.from * frameIncrement - Number(style.marginLeft)
			: -Infinity;
	const sceneRight =
		sceneRange !== null && frameIncrement !== null
			? sceneRange.end * frameIncrement - Number(style.marginLeft)
			: Infinity;
	const paintedStart = Math.max(negativeStartEnd, sceneLeft);
	// Packed scene clips overlap during transitions. Stop the outgoing paint at
	// the incoming scene so its trailing gap cannot be covered by the next clip.
	const packedRight =
		paintEndFrame !== null && frameIncrement !== null
			? paintEndFrame * frameIncrement - Number(style.marginLeft)
			: Infinity;
	const paintedEnd = Math.max(
		0,
		Math.min(Number(style.width), sceneRight, packedRight),
	);
	// Shared child rows need the same gap as Track clips, including when the
	// scene clips their trailing edge. Only inset the paint: timing, hit areas,
	// and trim handles keep their full width. Preserve tiny clips when zoomed out.
	const visualRightInset =
		(s.timelineTrack || sceneRange !== null) &&
		transitionWidth === null &&
		(rightEdgeVisible ||
			sceneRight <= Number(style.width) ||
			packedRight <= Number(style.width))
			? Number(style.width) -
				paintedEnd +
				Math.min(1, Math.max(0, paintedEnd - paintedStart - 1))
			: 0;
	// Back the antialiased rounded edge only when the glow is at the painted layer edge.
	const sequenceBackground =
		activeTrimEdge === null ||
		(activeTrimEdge === 'left' && leftTrimHighlight?.left !== negativeStartEnd)
			? style.background
			: `linear-gradient(to ${activeTrimEdge === 'left' ? 'right' : 'left'}, #00E500 0 2px, #00E50000 2px), ${style.background ?? TRANSPARENT}`;

	const actualStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			background: TRANSPARENT,
			opacity: 1,
		};
	}, [style]);

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

			{transitionWidth === null ? null : (
				<svg
					aria-hidden="true"
					style={{
						position: 'absolute',
						left: -(marqueeHorizontalBounds?.cropLeft ?? 0),
						top: 0,
						width: transitionWidth,
						height: Number(style.height),
						pointerEvents: 'none',
					}}
				>
					<polygon
						points={`0,0 ${transitionWidth},0 0,${Number(style.height)}`}
						fill={BLACK_ALPHA_22}
					/>
					<polygon
						points={`${transitionWidth},0 ${transitionWidth},${Number(style.height)} 0,${Number(style.height)}`}
						fill={WHITE_ALPHA_15}
					/>
				</svg>
			)}

			{s.timelineTrack ? (
				<div
					style={{
						position: 'absolute',
						left:
							2.5 +
							Math.max(labelOffset, negativeStartEnd + (premount?.width ?? 0)),
						right: 0,
						bottom: PACKED_LABEL_BOTTOM,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
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
					<ActionTooltip
						label={
							s.timelineTrack.role === 'track' && frozenFrame !== null
								? `${s.displayName} (frozen at frame ${frozenFrame})`
								: s.displayName
						}
						shortcut={null}
						delay={250}
						dismissOnClick
						triggerStyle={{
							alignSelf: 'flex-start',
							maxWidth: '100%',
							minWidth: 0,
							pointerEvents: 'auto',
						}}
					>
						<span
							style={{
								flex: 1,
								fontSize: 11,
								lineHeight: `${PACKED_LABEL_HEIGHT}px`,
								color: getTimelineColor(false, false),
								maskImage:
									'linear-gradient(to right, black calc(100% - 5px), transparent)',
								minWidth: 0,
								// Keep the fade in empty space unless the label is clipped.
								paddingRight: 5,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								WebkitMaskImage:
									'linear-gradient(to right, black calc(100% - 5px), transparent)',
							}}
						>
							{s.timelineTrack.role === 'track' && frozenFrame !== null ? (
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
							{s.timelineTrack.role === 'overlay' ? 'Overlay' : s.displayName}
						</span>
					</ActionTooltip>
				</div>
			) : null}

			{!s.timelineTrack &&
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

			{activeTrimEdge === null ||
			(activeTrimEdge === 'left' && leftTrimHighlight === null) ? null : (
				<div
					aria-hidden="true"
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left:
							activeTrimEdge === 'left' ? leftTrimHighlight?.left : undefined,
						right: activeTrimEdge === 'right' ? 0 : undefined,
						width:
							activeTrimEdge === 'left' && leftTrimHighlight
								? Math.min(EDGE_DRAG_HIGHLIGHT_WIDTH, leftTrimHighlight.width)
								: `min(${EDGE_DRAG_HIGHLIGHT_WIDTH}px, 100%)`,
						pointerEvents: 'none',
						background: `linear-gradient(to ${activeTrimEdge === 'left' ? 'right' : 'left'}, #00E500, #00E50000)`,
					}}
				/>
			)}
		</>
	);

	return (
		<div
			ref={ref}
			role="group"
			{...getSequenceAnnotationAttributes({
				sequence: s,
				location: annotationLocation,
				surface: 'layer',
			})}
			{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
			style={actualStyle}
			aria-label={s.displayName}
			data-track-item={s.timelineTrack?.role}
			onPointerDownCapture={onPointerDownCapture}
			onPointerDown={selectable ? onPointerDown : undefined}
			onClick={onClick ?? undefined}
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
			{(selected || containsSelection) && selectionBounds ? (
				<div
					aria-hidden="true"
					style={{
						position: 'absolute',
						inset: 0,
						left: selectionBounds.left,
						right: Math.max(
							visualRightInset,
							Number(style.width) -
								selectionBounds.left -
								selectionBounds.width,
						),
						borderRadius: 'inherit',
						boxShadow: `inset 0 0 0 2px ${WHITE}`,
						pointerEvents: 'none',
					}}
				/>
			) : null}
			<div style={{pointerEvents: 'auto'}}>{edgeDragHandles}</div>
		</div>
	);
};

const TimelineSequenceInner: React.FC<{
	readonly s: TimelineTrackData['sequence'];
	readonly labelStartFrame: number | null;
	readonly paintEndFrame: number | null;
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
	readonly windowWidth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
	readonly sequenceFrameOffset: number;
	readonly cascadedStart: number;
	readonly localStart: number;
	readonly parentVisibleStart: number;
	readonly parentVisibleEnd: number | null;
}> = ({
	s,
	labelStartFrame,
	paintEndFrame,
	connectedCompositions,
	windowWidth,
	nodePathInfo,
	keyframeDisplayOffset,
	keyframePlaybackRate,
	sequenceFrameOffset,
	cascadedStart,
	localStart,
	parentVisibleStart,
	parentVisibleEnd,
}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined

	const video = Internals.useVideo();
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const registryEntry = useTimelineSequenceRegistry(s.id);
	const originalSequence = registryEntry?.sequence ?? null;
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const renderWindow = useContext(TimelineViewportContext);
	const mediaDurationDragLimitsRegistry = useContext(
		TimelineSequenceMediaDurationDragLimitsContext,
	);
	const edgeHighlightController = useContext(TimelineEdgeHighlightContext);
	const dragAwareDoubleClick = useMemo(
		() => createDragAwareDoubleClickTracker(),
		[],
	);
	const [activeEdgeHighlight, setActiveEdgeHighlight] =
		useState<TimelineEdgeHighlightEdge | null>(null);
	const activeTrimEdge =
		activeEdgeHighlight === 'source-only' ? 'left' : activeEdgeHighlight;
	useEffect(() => {
		if (!nodePath) {
			return;
		}

		return edgeHighlightController?.register(
			stringifySequenceSubscriptionKey(nodePath),
			setActiveEdgeHighlight,
		);
	}, [edgeHighlightController, nodePath]);
	const naturalSequenceDuration = useTimelineSequenceNaturalDuration({
		sequenceId: s.id,
		enabled:
			activeEdgeHighlight !== null && activeEdgeHighlight !== 'source-only',
	});
	const previousCascadingSequenceId = registryEntry?.previousSequenceId ?? null;
	const previousCascadingOverrideId = registryEntry?.previousOverrideId ?? null;
	const nextCascadingOverrideId = registryEntry?.nextOverrideId ?? null;
	const startEdgeDrag = useCallback(
		(
			edge: TimelineEdgeHighlightEdge,
			highlightAdjacent: boolean,
			targetNodePaths: readonly SequencePropsSubscriptionKey[],
		) => {
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
						? previousCascadingOverrideId
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
				})),
			);
		},
		[
			previousCascadingOverrideId,
			nextCascadingOverrideId,
			overrideIdToNodePathMappingsRef,
			edgeHighlightController,
		],
	);
	const startLeftEdgeDrag = useCallback(
		(
			mode: 'ripple' | 'source-only' | 'self-trim',
			targetNodePaths: readonly SequencePropsSubscriptionKey[],
		) =>
			startEdgeDrag(
				mode === 'source-only' ? 'source-only' : 'left',
				mode === 'ripple',
				targetNodePaths,
			),
		[startEdgeDrag],
	);
	const startRightEdgeDrag = useCallback(
		(targetNodePaths: readonly SequencePropsSubscriptionKey[]) =>
			startEdgeDrag('right', true, targetNodePaths),
		[startEdgeDrag],
	);
	const endEdgeDrag = useCallback(
		(wasDragged: boolean) => {
			edgeHighlightController?.setHighlights([]);
			dragAwareDoubleClick.endPointerGesture(wasDragged);
		},
		[dragAwareDoubleClick, edgeHighlightController],
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
	const naturalMediaDuration =
		(s.type === 'audio' || s.type === 'video') &&
		mediaMetadata !== null &&
		s.playbackRate > 0
			? Math.max(
					0,
					(mediaMetadata.duration * (video?.fps ?? 30) -
						getTimelineMediaStartFrame({
							startMediaFrom: s.startMediaFrom,
							mediaFrameAtSequenceZero: s.mediaFrameAtSequenceZero,
							sequenceFrameOffset,
							playbackRate: s.playbackRate,
						})) /
						(s.playbackRate * s.sequencePlaybackRate),
				)
			: null;
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
	const volumeKeyframeStatus = useMemo(() => {
		if (volumeDragOverride?.type === 'keyframed') {
			return volumeDragOverride.status;
		}

		return propStatusesForOverride?.volume?.status === 'keyframed'
			? propStatusesForOverride.volume
			: null;
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
	const previousCascadingSequenceNodePath = previousCascadingOverrideId
		? overrideIdToNodePathMappingsRef.current[previousCascadingOverrideId]
		: null;
	const previousCascadingSequenceCanResize = Boolean(
		isStudioInteractivityEnabled() &&
		previousCascadingSequenceNodePath &&
		Internals.getPropStatusesCtx(
			propStatuses,
			previousCascadingSequenceNodePath,
		)?.durationInFrames?.status === 'static',
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const showPremounting = getStudioShowPremounting();
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && isStudioInteractivityEnabled();
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const selectAsset = useSelectAsset();
	const assetContextMenu = useAssetTimelineContextMenu();
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
			if (!dragAwareDoubleClick.acceptClickAsDoubleClick(e)) {
				return;
			}

			performSequenceDoubleClick(e);
		},
		[dragAwareDoubleClick, performSequenceDoubleClick],
	);
	const canHandleSequenceDoubleClick =
		connectedCompositions.length === 1 || canOpenSource;
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
			sequences: sequencesRef.current,
			overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
			propStatuses,
			splitFrame: getCurrentFrame(),
		})?.catch(() => undefined);
	}, [
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
			if (assetContextMenu !== null) {
				return assetContextMenu;
			}

			if (selectable && !selected) {
				onSelect({shiftKey: false, toggleKey: false});
			}

			if (selectedSequenceNodePathInfos !== null) {
				return getMultiSequenceContextMenuItems({
					getContextForAgents: () =>
						getSequencesContextForAgents({
							nodePathInfos: selectedSequenceNodePathInfos,
							overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
							sequences: sequencesRef.current,
						}),
					deleteDisabled: !previewInteractive,
					duplicateDisabled: !previewInteractive,
					splitDisabled: !previewInteractive,
					onDeleteSelectedSequences,
					onDuplicateSelectedSequences,
					onSplitSelectedSequences,
				});
			}

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
						? [
								...(splitMenuItem ? [splitMenuItem] : []),
								...(freezeFrameMenuItem ? [freezeFrameMenuItem] : []),
							]
						: [],
				},
				contextMenuTarget,
			);
		},
		[
			assetContextMenu,
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
			validatedLocation?.source,
		],
	);
	const {frozenFrame} = s;

	const {onPointerDown: onMoveDragPointerDown} = useTimelineSequenceFromDrag({
		nodePathInfo,
		windowWidth,
		timelineDurationInFrames: video?.durationInFrames ?? 1,
		onDragEnd: dragAwareDoubleClick.endPointerGesture,
	});

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const displayDurationInFrames = s.loopDisplay
		? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
		: s.duration;
	const keyframedTimelineVolume = useMemo((): readonly number[] | null => {
		if (volumeKeyframeStatus === null) {
			return null;
		}

		if (
			!Number.isFinite(displayDurationInFrames) ||
			displayDurationInFrames <= 0
		) {
			return [];
		}

		const resolvedDisplayOffset = getKeyframeDisplayOffset({
			propStatus: volumeKeyframeStatus,
			keyframeDisplayOffset,
			keyframePlaybackRate,
		});
		const resolvedPlaybackRate = getKeyframePlaybackRate(
			volumeKeyframeStatus,
			keyframePlaybackRate,
		);
		const firstDisplayFrame = s.from + (s.loopDisplay?.startOffset ?? 0);
		const curve: number[] = [];
		for (let index = 0; index < Math.ceil(displayDurationInFrames); index++) {
			const value = Internals.interpolateKeyframedStatus({
				forceSpringAllowTail: null,
				frame:
					(firstDisplayFrame + index - resolvedDisplayOffset) *
					resolvedPlaybackRate,
				status: volumeKeyframeStatus,
			});
			if (typeof value !== 'number' || !Number.isFinite(value)) {
				return null;
			}

			curve.push(Math.max(0, value));
		}

		return curve;
	}, [
		displayDurationInFrames,
		keyframeDisplayOffset,
		keyframePlaybackRate,
		s.from,
		s.loopDisplay?.startOffset,
		volumeKeyframeStatus,
	]);
	const timelineVolume = keyframedTimelineVolume ?? 1;

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
			height: '100%',
		};
	}, [visibleLayout]);
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
	const isMedia = s.type === 'audio' || s.type === 'video';
	const layerHeight =
		s.timelineTrack?.role === 'overlay' ||
		s.timelineTrack?.role === 'transition'
			? TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT - TIMELINE_ITEM_BORDER_BOTTOM
			: s.timelineTrack
				? TIMELINE_PACKED_TRACK_HEIGHT
				: getTimelineLayerHeight(s.type);
	const trimOutline = (() => {
		if (
			activeEdgeHighlight === null ||
			activeEdgeHighlight === 'source-only' ||
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

		const start = Math.max(parentStart, 0, s.from - trimmedBefore);
		const end = Math.min(
			parentEnd,
			video.durationInFrames,
			s.from + displayDurationInFrames + trimmedAfter,
		);
		const leftWidth = Math.max(0, s.from - start) * frameIncrement;
		const rightStart = s.from + displayDurationInFrames;
		const rightWidth = Math.max(0, end - rightStart) * frameIncrement;
		if (leftWidth === 0 && rightWidth === 0) {
			return null;
		}

		return (
			<>
				{leftWidth > 0 ? (
					<div
						aria-hidden="true"
						style={{
							position: 'absolute',
							left: start * frameIncrement,
							width: leftWidth,
							height: layerHeight,
							zIndex: s.timelineTrack ? 1 : undefined,
							border: `2px solid ${WHITE}`,
							borderRight: 0,
							borderRadius: '2px 0 0 2px',
							pointerEvents: 'none',
						}}
					/>
				) : null}
				{rightWidth > 0 ? (
					<div
						aria-hidden="true"
						style={{
							position: 'absolute',
							left: rightStart * frameIncrement,
							width: rightWidth,
							height: layerHeight,
							zIndex: s.timelineTrack ? 1 : undefined,
							border: `2px solid ${WHITE}`,
							borderLeft: 0,
							borderRadius: '0 2px 2px 0',
							pointerEvents: 'none',
						}}
					/>
				) : null}
			</>
		);
	})();
	const endsAtContainerBoundary =
		Math.ceil(s.from + displayDurationInFrames) >=
		Math.ceil(Math.min(parentEnd, video.durationInFrames));
	const hasImplicitMediaDuration =
		(s.type === 'audio' || s.type === 'video') &&
		propStatusesForOverride?.durationInFrames?.status === 'static' &&
		propStatusesForOverride.durationInFrames.codeValue === undefined;
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
				hasImplicitDuration: hasImplicitMediaDuration,
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

	const showRightBorderRadius =
		visibleLayout?.rightEdgeVisible === true &&
		(s.autoDuration || endsAtContainerBoundary || endsAtNaturalMediaDuration);

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
							: BLUE,
			borderTopLeftRadius: showLeftBorderRadius ? 2 : 0,
			borderBottomLeftRadius: showLeftBorderRadius ? 2 : 0,
			borderTopRightRadius: showRightBorderRadius ? 2 : 0,
			borderBottomRightRadius: showRightBorderRadius ? 2 : 0,
			position: 'absolute',
			isolation: s.timelineTrack ? 'isolate' : undefined,
			height: layerHeight,
			top: s.timelineTrack ? 0 : undefined,
			marginLeft: visibleLayout?.marginLeft ?? 0,
			width: visibleLayout?.width ?? 0,
			color: WHITE,
			// Edge handles extend outside the layer; media is clipped separately.
			overflow: 'visible',
		};
	}, [
		s.type,
		s.timelineTrack,
		showLeftBorderRadius,
		showRightBorderRadius,
		visibleLayout,
		layerHeight,
	]);

	const showRightEdgeDragHandle =
		isTimelineSequenceDurationDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		durationCanResize &&
		(!isMedia || Boolean(s.loopDisplay) || mediaDurationDragLimits !== null);
	const isFirstCascadingSequence =
		isCascadingSequence(s) && previousCascadingSequenceId === null;
	const showLeftEdgeDragHandle =
		isTimelineSequenceLeftEdgeDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		(isFirstCascadingSequence
			? trimBeforeCanUpdate
			: previousCascadingSequenceId !== null
				? previousCascadingSequenceCanResize
				: fromCanUpdate && durationCanUpdate && trimBeforeCanUpdate);
	const canShowSecondaryLeftEdgeAction =
		(isMedia || (isCascadingSequence(s) && !isFirstCascadingSequence)) &&
		isTimelineSequenceLeftEdgeDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		trimBeforeCanUpdate &&
		(isMedia || durationCanUpdate) &&
		(visibleLayout?.media?.width ?? 0) >= MIN_SECONDARY_LEFT_EDGE_ACTION_WIDTH;
	const secondaryLeftEdgeAction = canShowSecondaryLeftEdgeAction
		? isMedia
			? 'source-only'
			: 'self-trim'
		: null;

	if ((maxMediaDuration === null && !s.loopDisplay) || visibleLayout === null) {
		return trimOutline;
	}

	const mediaDisplayOffsetInFrames = visibleLayout.media
		? visibleLayout.media.offset / frameIncrement
		: 0;
	const mediaDisplayDurationInFrames = visibleLayout.media
		? visibleLayout.media.width / frameIncrement
		: 0;

	const sequence = (
		<TimelineSequenceBar
			s={s}
			labelOffset={
				labelStartFrame === null
					? 0
					: Math.max(
							0,
							labelStartFrame * frameIncrement - visibleLayout.marginLeft,
						)
			}
			connectedComposition={connectedCompositions[0] ?? null}
			annotationLocation={originalLocation}
			paintEndFrame={paintEndFrame}
			activeTrimEdge={activeTrimEdge}
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
			onClick={canHandleSequenceDoubleClick ? onSequenceClick : null}
			edgeDragHandles={
				<>
					{(showLeftEdgeDragHandle || secondaryLeftEdgeAction) &&
					visibleLayout.media?.offset === 0 &&
					// Keep the captured handle mounted when a trim crosses frame zero.
					(negativeStartWidth === 0 || activeTrimEdge === 'left') &&
					nodePathInfo &&
					validatedLocation ? (
						<div
							style={{
								position: 'absolute',
								left: visibleLayout.media.left,
								width: visibleLayout.media.width,
								top: 0,
								bottom: 0,
								pointerEvents: 'none',
							}}
						>
							<TimelineSequenceLeftEdgeDragHandle
								cursor={`${timelineTrimEdgeCursor}, ew-resize`}
								trimBeforeCursor={`${timelineLeftEdgeCursor}, e-resize`}
								edgeEnabled={showLeftEdgeDragHandle}
								edgeMode={isFirstCascadingSequence ? 'source-only' : 'ripple'}
								secondaryAction={secondaryLeftEdgeAction}
								nodePathInfo={nodePathInfo}
								windowWidth={windowWidth}
								timelineDurationInFrames={video.durationInFrames ?? 1}
								initialEdgeFrame={s.from}
								fps={video.fps}
								onDragStart={startLeftEdgeDrag}
								onDragEnd={endEdgeDrag}
								onSelect={onSelect}
								selected={selected}
							/>
						</div>
					) : null}
					{showRightEdgeDragHandle &&
					visibleLayout.rightEdgeVisible &&
					nodePathInfo &&
					validatedLocation ? (
						<TimelineSequenceRightEdgeDragHandle
							cursor={`${timelineTrimEdgeCursor}, ew-resize`}
							nodePathInfo={nodePathInfo}
							mediaDurationDragLimits={mediaDurationDragLimits}
							windowWidth={windowWidth}
							timelineDurationInFrames={video.durationInFrames ?? 1}
							initialEdgeFrame={
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
							onSelect={onSelect}
							selected={selected}
						/>
					) : null}
				</>
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

export const TimelineSequence = React.memo(TimelineSequenceFn);
