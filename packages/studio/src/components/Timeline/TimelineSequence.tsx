import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {_InternalTypes, TSequence} from 'remotion';
import {Internals, useCurrentFrame} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BLUE,
	TIMELINE_BACKGROUND_COLOR,
	TIMELINE_AUDIO_GRADIENT,
	TIMELINE_IMAGE_GRADIENT,
	TIMELINE_NEGATIVE_START_BACKGROUND_COLOR,
	TIMELINE_NEGATIVE_START_BORDER_COLOR,
	TIMELINE_VIDEO_GRADIENT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_20,
	WHITE_ALPHA_50,
} from '../../helpers/colors';
import {createDragAwareDoubleClickTracker} from '../../helpers/drag-aware-double-click';
import {
	getConnectedCompositionFrame,
	getSequenceDoubleClickAction,
} from '../../helpers/get-sequence-double-click-action';
import {
	getTimelineSequenceLayout,
	SEQUENCE_BORDER_WIDTH,
} from '../../helpers/get-timeline-sequence-layout';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {isVideoWithLastFrameHold} from '../../helpers/is-video-with-last-frame-hold';
import {
	getTimelineLayerHeight,
	TIMELINE_LAYER_HEIGHT_AUDIO,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {useMaxMediaDuration} from '../../helpers/use-max-media-duration';
import {SetSelectedModalContext} from '../../state/modals';
import {AudioWaveform} from '../AudioWaveform';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {ContextMenu} from '../ContextMenu';
import {deleteJsxNode} from '../delete-jsx-node-api';
import {useSelectComposition} from '../InitialCompositionLoader';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSelectAsset} from '../use-select-asset';
import {disableSequenceInteractivity} from './disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {getSequenceContextMenuItems} from './get-sequence-context-menu-items';
import {getTimelineSequenceVisibleLayout} from './get-timeline-sequence-visible-layout';
import {getCurrentFrame} from './imperative-state';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';
import {TimelineImageInfo} from './TimelineImageInfo';
import {
	isTimelineSelectionModifierEvent,
	shouldSelectTimelineRowOnPointerDown,
	TIMELINE_MARQUEE_ITEM_ATTR,
	useTimelineMarqueeSelectableItem,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';
import {
	canResizeTimelineSequenceDuration,
	isCascadingSequence,
	isTimelineSequenceDurationDraggable,
	isTimelineSequenceLeftEdgeDraggable,
	TimelineSequenceLeftEdgeDragHandle,
	TimelineSequenceRightEdgeDragHandle,
	useTimelineSequenceFromDrag,
} from './TimelineSequenceRightEdgeDragHandle';
import {TimelineVideoInfo} from './TimelineVideoInfo';
import {TimelineViewportContext} from './TimelineViewport';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useOpenSequenceInApps} from './use-open-sequence-in-apps';
import {getSequenceFreezeFrameMenuItem} from './use-sequence-freeze-frame-menu-item';

const TimelineSequenceFn: React.FC<{
	readonly s: TSequence;
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
	readonly cascadedStart: number;
	readonly localStart: number;
}> = ({
	s,
	connectedCompositions,
	nodePathInfo,
	sequenceFrameOffset,
	cascadedStart,
	localStart,
}) => {
	const windowWidth = useContext(TimelineWidthContext);

	if (windowWidth === null) {
		return null;
	}

	return (
		<TimelineSequenceInner
			windowWidth={windowWidth}
			s={s}
			connectedCompositions={connectedCompositions}
			nodePathInfo={nodePathInfo}
			sequenceFrameOffset={sequenceFrameOffset}
			cascadedStart={cascadedStart}
			localStart={localStart}
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
			border: `${SEQUENCE_BORDER_WIDTH}px solid ${TIMELINE_NEGATIVE_START_BORDER_COLOR}`,
			borderBottomLeftRadius: showLeftEdge ? 2 : 0,
			borderLeft: showLeftEdge
				? `${SEQUENCE_BORDER_WIDTH}px solid ${TIMELINE_NEGATIVE_START_BORDER_COLOR}`
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

const TimelineSequenceCurrentFrame: React.FC<{
	readonly s: TSequence;
	readonly displayDurationInFrames: number;
	readonly premount: {readonly left: number; readonly width: number} | null;
	readonly postmount: {readonly left: number; readonly width: number} | null;
	readonly negativeStart: {
		readonly left: number;
		readonly width: number;
	} | null;
	readonly leftEdgeVisible: boolean;
	readonly negativeStartClipped: boolean;
	readonly style: React.CSSProperties;
	readonly children: React.ReactNode;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
	readonly fromCanUpdate: boolean;
	readonly frozenFrame: number | null;
	readonly onMoveDragPointerDown: (
		e: React.PointerEvent<HTMLDivElement>,
	) => void;
	readonly onPointerDownCapture: () => void;
	readonly onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({
	s,
	displayDurationInFrames,
	premount,
	postmount,
	negativeStart,
	leftEdgeVisible,
	negativeStartClipped,
	style,
	children,
	nodePathInfo,
	sequenceFrameOffset,
	fromCanUpdate,
	frozenFrame,
	onMoveDragPointerDown,
	onPointerDownCapture,
	onDoubleClick,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const {onSelect, selectable, selected, selectionItem} =
		useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const {selectedItems} = useTimelineSelection();
	useTimelineMarqueeSelectableItem(selectionItem, ref);

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
	const frame = useCurrentFrame();
	const relativeFrame = frame - s.from;
	const sequenceFrame = relativeFrame + sequenceFrameOffset;
	const relativeFrameWithPremount = relativeFrame + (s.premountDisplay ?? 0);
	const relativeFrameWithPostmount = relativeFrame - displayDurationInFrames;

	const roundedFrame = Math.round(sequenceFrame * 100) / 100;

	const isInRange =
		relativeFrame >= 0 && relativeFrame < displayDurationInFrames;
	const isPremounting =
		relativeFrameWithPremount >= 0 &&
		relativeFrameWithPremount < displayDurationInFrames &&
		!isInRange;
	const isPostmounting =
		relativeFrameWithPostmount >= 0 &&
		relativeFrameWithPostmount < (s.postmountDisplay ?? 0) &&
		!isInRange;
	const negativeStartEnd = negativeStart
		? negativeStart.left + negativeStart.width
		: 0;

	const actualStyle: React.CSSProperties = useMemo(() => {
		const hasSelectedTrack = selectedItems.some(
			(item) => item.type !== 'guide',
		);

		return {
			...style,
			background: negativeStart ? TRANSPARENT : style.background,
			border: negativeStart ? 'none' : style.border,
			opacity: hasSelectedTrack && !selected && !containsSelection ? 0.75 : 1,
		};
	}, [containsSelection, negativeStart, selected, selectedItems, style]);

	const content = (
		<>
			{premount ? (
				<div
					style={{
						left: premount.left,
						width: premount.width,
						height: '100%',
						background: `repeating-linear-gradient(
								-45deg,
								${TRANSPARENT},
								${TRANSPARENT} 2px,
								${isPremounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 2px,
								${isPremounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 4px
							)`,
						position: 'absolute',
					}}
				/>
			) : null}

			{postmount ? (
				<div
					style={{
						left: postmount.left,
						width: postmount.width,
						height: '100%',
						background: `repeating-linear-gradient(
								-45deg,
								${TRANSPARENT},
								${TRANSPARENT} 2px,
								${isPostmounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 2px,
								${isPostmounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 4px
							)`,
						position: 'absolute',
					}}
				/>
			) : null}

			{children}

			{s.type !== 'audio' &&
			s.type !== 'video' &&
			s.type !== 'image' &&
			s.loopDisplay === undefined &&
			(isInRange || isPremounting || isPostmounting) ? (
				<div
					style={{
						paddingLeft:
							5 + (negativeStart?.width ?? 0) + (premount?.width ?? 0),
						height: '100%',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<TimelineSequenceFrame
						premounted={isPremounting}
						postmounted={isPostmounting ? s.duration - 1 : null}
						roundedFrame={roundedFrame}
						frozenFrame={frozenFrame}
					/>
				</div>
			) : null}
		</>
	);

	return (
		<div
			ref={ref}
			{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
			style={actualStyle}
			title={s.displayName}
			onPointerDownCapture={onPointerDownCapture}
			onPointerDown={selectable ? onPointerDown : undefined}
			onDoubleClick={onDoubleClick}
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
							background: style.background,
							border: style.border,
							borderBottomLeftRadius: 0,
							borderBottomRightRadius: style.borderBottomRightRadius,
							borderLeft: 'none',
							borderRightColor: style.borderRightColor,
							borderTopLeftRadius: 0,
							borderTopRightRadius: style.borderTopRightRadius,
							boxSizing: 'border-box',
							height: '100%',
							left: negativeStartEnd,
							overflow: 'hidden',
							position: 'absolute',
							top: 0,
							width: `calc(100% - ${negativeStartEnd}px)`,
						}}
					>
						<div
							style={{
								height: '100%',
								left: -negativeStartEnd,
								position: 'absolute',
								top: 0,
								width: style.width,
							}}
						>
							{content}
						</div>
					</div>
				</>
			) : (
				content
			)}
		</div>
	);
};

const TimelineSequenceInner: React.FC<{
	readonly s: TSequence;
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
	readonly windowWidth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
	readonly cascadedStart: number;
	readonly localStart: number;
}> = ({
	s,
	connectedCompositions,
	windowWidth,
	nodePathInfo,
	sequenceFrameOffset,
	cascadedStart,
	localStart,
}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined

	const video = Internals.useVideo();
	const renderWindow = useContext(TimelineViewportContext);
	const dragAwareDoubleClick = useMemo(
		() => createDragAwareDoubleClickTracker(),
		[],
	);

	const maxMediaDuration = useMaxMediaDuration(s, video?.fps ?? 30);
	const effectiveMaxMediaDuration = s.loopDisplay ? null : maxMediaDuration;
	const extendVideoLastFrame = isVideoWithLastFrameHold(s);

	const {
		canOpenInEditor,
		canConfigureApps,
		codingAgentInfo,
		editorInfo,
		openInCodingAgent,
		openInEditor,
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
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const propStatusesForOverride = useMemo(() => {
		return nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
	}, [propStatuses, nodePath]);
	const durationCanUpdate = Boolean(
		isStudioInteractivityEnabled() &&
		propStatusesForOverride?.durationInFrames?.status === 'static',
	);
	const durationCanResize = Boolean(
		isStudioInteractivityEnabled() &&
		canResizeTimelineSequenceDuration({
			sequence: s,
			status: propStatusesForOverride?.durationInFrames,
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
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && isStudioInteractivityEnabled();
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const selectAsset = useSelectAsset();
	const selectComposition = useSelectComposition();
	const confirm = useConfirmationDialog();
	const {onSelect, selectable} = useTimelineRowSelection(nodePathInfo);
	const onSequenceDoubleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isTimelineSelectionModifierEvent(e)) {
				e.stopPropagation();
				return;
			}

			const action = getSequenceDoubleClickAction({
				button: e.button,
				canOpenInEditor,
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

			openInEditor(null);
		},
		[
			canOpenInEditor,
			connectedCompositions,
			dragAwareDoubleClick,
			openInEditor,
			s,
			selectComposition,
			sequenceFrameOffset,
		],
	);
	const canHandleSequenceDoubleClick =
		connectedCompositions.length === 1 || canOpenInEditor;
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
	const onDeleteSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath || deleteDisabled) {
			return;
		}

		if (nodePathInfo && nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
			const shouldDelete = await confirm({
				title: 'Delete sequence?',
				message:
					'This sequence is programmatically duplicated ' +
					nodePathInfo.numberOfSequencesWithThisNodePath +
					' times in the code. Deleting removes all instances. Continue?',
				confirmLabel: 'Delete',
			});
			if (!shouldDelete) {
				return;
			}
		}

		try {
			const result = await deleteJsxNode({
				nodes: [
					{
						fileName: validatedLocation.source,
						nodePath: nodePath.nodePath,
					},
				],
			});
			if (!result.success) {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [
		confirm,
		deleteDisabled,
		nodePath,
		nodePathInfo,
		validatedLocation?.source,
	]);
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
	const getContextMenuItems = useCallback(() => {
		if (selectable) {
			onSelect({shiftKey: false, toggleKey: false});
		}

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

		return getSequenceContextMenuItems({
			assetLinkInfo: mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null,
			canOpenInEditor,
			codingAgentInfo,
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
			sourceActions:
				isStudioInteractivityEnabled() && freezeFrameMenuItem
					? [freezeFrameMenuItem]
					: [],
		});
	}, [
		canOpenInEditor,
		canConfigureApps,
		codingAgentInfo,
		deleteDisabled,
		disableInteractivityDisabled,
		duplicateDisabled,
		editorInfo,
		isProgrammaticallyDuplicated,
		mediaSrc,
		nodePath,
		onSelect,
		onDeleteSequenceFromSource,
		onDisableSequenceInteractivity,
		onDuplicateSequenceFromSource,
		openInCodingAgent,
		openInEditor,
		originalLocation,
		previewInteractive,
		previewServerState,
		propStatusesForOverride,
		s,
		selectAsset,
		selectable,
		sequenceFrameOffset,
		setPropStatuses,
		setSelectedModal,
		validatedLocation?.source,
	]);
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
			startFromMedia:
				s.type === 'sequence' || s.type === 'image' ? 0 : s.startMediaFrom,
			maxMediaDuration: effectiveMaxMediaDuration,
			video,
			windowWidth,
			premountDisplay: s.premountDisplay,
			postmountDisplay: s.postmountDisplay,
		});
	}, [
		cascadedStart,
		displayDurationInFrames,
		effectiveMaxMediaDuration,
		s,
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
	const showLeftBorderRadius =
		visibleLayout?.leftEdgeVisible === true &&
		localStart >= 0 &&
		(s.trimBefore ?? 0) === 0;

	const style: React.CSSProperties = useMemo(() => {
		return {
			background:
				s.type === 'audio'
					? TIMELINE_AUDIO_GRADIENT
					: s.type === 'video'
						? TIMELINE_VIDEO_GRADIENT
						: s.type === 'image'
							? TIMELINE_IMAGE_GRADIENT
							: BLUE,
			border: `${SEQUENCE_BORDER_WIDTH}px solid ${WHITE_ALPHA_20}`,
			borderLeftColor:
				visibleLayout?.leftEdgeVisible && !negativeStartClipped
					? WHITE_ALPHA_20
					: TRANSPARENT,
			borderRightColor: visibleLayout?.rightEdgeVisible
				? WHITE_ALPHA_20
				: TRANSPARENT,
			borderTopLeftRadius: showLeftBorderRadius ? 2 : 0,
			borderBottomLeftRadius: showLeftBorderRadius ? 2 : 0,
			borderTopRightRadius: visibleLayout?.rightEdgeVisible ? 2 : 0,
			borderBottomRightRadius: visibleLayout?.rightEdgeVisible ? 2 : 0,
			position: 'absolute',
			height: getTimelineLayerHeight(s.type),
			marginLeft: visibleLayout?.marginLeft ?? 0,
			width: visibleLayout?.width ?? 0,
			color: WHITE,
			overflow: 'hidden',
		};
	}, [negativeStartClipped, s.type, showLeftBorderRadius, visibleLayout]);

	const showRightEdgeDragHandle =
		isTimelineSequenceDurationDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		durationCanResize;
	const showLeftEdgeDragHandle =
		isTimelineSequenceLeftEdgeDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		(isCascadingSequence(s) || fromCanUpdate) &&
		durationCanUpdate &&
		trimBeforeCanUpdate;

	if ((maxMediaDuration === null && !s.loopDisplay) || visibleLayout === null) {
		return null;
	}

	const frameIncrement =
		(windowWidth - TIMELINE_PADDING * 2) / video.durationInFrames;
	const mediaDisplayOffsetInFrames = visibleLayout.media
		? visibleLayout.media.offset / frameIncrement
		: 0;
	const mediaDisplayDurationInFrames = visibleLayout.media
		? visibleLayout.media.width / frameIncrement
		: 0;

	const sequence = (
		<TimelineSequenceCurrentFrame
			s={s}
			displayDurationInFrames={displayDurationInFrames}
			premount={visibleLayout.premount}
			postmount={visibleLayout.postmount}
			negativeStart={visibleLayout.negativeStart}
			leftEdgeVisible={visibleLayout.leftEdgeVisible}
			negativeStartClipped={negativeStartClipped}
			style={style}
			nodePathInfo={nodePathInfo}
			sequenceFrameOffset={sequenceFrameOffset}
			fromCanUpdate={fromCanUpdate}
			frozenFrame={frozenFrame}
			onMoveDragPointerDown={onMoveDragPointerDown}
			onPointerDownCapture={dragAwareDoubleClick.beginPointerGesture}
			onDoubleClick={
				canHandleSequenceDoubleClick ? onSequenceDoubleClick : undefined
			}
		>
			{s.type === 'audio' && visibleLayout.media ? (
				<div style={mediaVisualizationStyle}>
					<AudioWaveform
						src={s.src}
						height={TIMELINE_LAYER_HEIGHT_AUDIO}
						doesVolumeChange={s.doesVolumeChange}
						muted={s.muted}
						visualizationWidth={visibleLayout.media.width}
						startFrom={s.startMediaFrom}
						durationInFrames={s.duration}
						displayOffsetInFrames={mediaDisplayOffsetInFrames}
						displayDurationInFrames={mediaDisplayDurationInFrames}
						volume={s.volume}
						playbackRate={s.playbackRate}
						loopDisplay={s.loopDisplay}
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
					mediaFrameAtSequenceZero={s.mediaFrameAtSequenceZero}
					sequenceFrameOffset={sequenceFrameOffset}
					playbackRate={s.playbackRate}
					volume={s.volume}
					muted={s.muted}
					doesVolumeChange={s.doesVolumeChange}
					marginLeft={visibleLayout.media.left}
					loopDisplay={s.loopDisplay}
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
					fullWidth={width}
					visibleOffset={visibleLayout.cropLeft}
					visibleWidth={visibleLayout.width}
				/>
			)}
			{showLeftEdgeDragHandle &&
			visibleLayout.leftEdgeVisible &&
			negativeStartWidth === 0 &&
			nodePathInfo &&
			validatedLocation ? (
				<TimelineSequenceLeftEdgeDragHandle
					nodePathInfo={nodePathInfo}
					windowWidth={windowWidth}
					timelineDurationInFrames={video.durationInFrames ?? 1}
					onDragEnd={dragAwareDoubleClick.endPointerGesture}
				/>
			) : null}
			{showRightEdgeDragHandle &&
			visibleLayout.rightEdgeVisible &&
			nodePathInfo &&
			validatedLocation ? (
				<TimelineSequenceRightEdgeDragHandle
					nodePathInfo={nodePathInfo}
					windowWidth={windowWidth}
					timelineDurationInFrames={video.durationInFrames ?? 1}
					onDragEnd={dragAwareDoubleClick.endPointerGesture}
				/>
			) : null}
		</TimelineSequenceCurrentFrame>
	);

	return previewConnected || window.remotion_isReadOnlyStudio ? (
		<ContextMenu getItems={getContextMenuItems}>{sequence}</ContextMenu>
	) : (
		sequence
	);
};

export const TimelineSequence = React.memo(TimelineSequenceFn);
