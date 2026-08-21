import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {_InternalTypes, TSequence} from 'remotion';
import {Internals, useCurrentFrame} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BLUE,
	TIMELINE_AUDIO_GRADIENT,
	TIMELINE_IMAGE_GRADIENT,
	TIMELINE_VIDEO_GRADIENT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_20,
	WHITE_ALPHA_50,
} from '../../helpers/colors';
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
	getTimelineSequenceOpacity,
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
}> = ({s, connectedCompositions, nodePathInfo, sequenceFrameOffset}) => {
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
		/>
	);
};

const TimelineSequenceCurrentFrame: React.FC<{
	readonly s: TSequence;
	readonly displayDurationInFrames: number;
	readonly premount: {readonly left: number; readonly width: number} | null;
	readonly postmount: {readonly left: number; readonly width: number} | null;
	readonly style: React.CSSProperties;
	readonly children: React.ReactNode;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
	readonly fromCanUpdate: boolean;
	readonly frozenFrame: number | null;
	readonly onMoveDragPointerDown: (
		e: React.PointerEvent<HTMLDivElement>,
	) => void;
	readonly onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = ({
	s,
	displayDurationInFrames,
	premount,
	postmount,
	style,
	children,
	nodePathInfo,
	sequenceFrameOffset,
	fromCanUpdate,
	frozenFrame,
	onMoveDragPointerDown,
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

	const actualStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			opacity: getTimelineSequenceOpacity({
				containsSelection,
				selected,
				selectedItems,
			}),
		};
	}, [containsSelection, selected, selectedItems, style]);

	return (
		<div
			ref={ref}
			{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
			style={actualStyle}
			title={s.displayName}
			onPointerDown={selectable ? onPointerDown : undefined}
			onDoubleClick={onDoubleClick}
		>
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
						paddingLeft: 5 + (premount?.width ?? 0),
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
		</div>
	);
};

const TimelineSequenceInner: React.FC<{
	readonly s: TSequence;
	readonly connectedCompositions: readonly _InternalTypes['AnyComposition'][];
	readonly windowWidth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
}> = ({
	s,
	connectedCompositions,
	windowWidth,
	nodePathInfo,
	sequenceFrameOffset,
}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined

	const video = Internals.useVideo();
	const renderWindow = useContext(TimelineViewportContext);

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
	});

	if (!video) {
		throw new TypeError('Expected video config');
	}

	const displayDurationInFrames = s.loopDisplay
		? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
		: s.duration;

	const {marginLeft, width, premountWidth, postmountWidth} = useMemo(() => {
		return getTimelineSequenceLayout({
			durationInFrames: displayDurationInFrames,
			startFrom: s.loopDisplay ? s.from + s.loopDisplay.startOffset : s.from,
			startFromMedia:
				s.type === 'sequence' || s.type === 'image' ? 0 : s.startMediaFrom,
			maxMediaDuration: effectiveMaxMediaDuration,
			video,
			windowWidth,
			premountDisplay: s.premountDisplay,
			postmountDisplay: s.postmountDisplay,
		});
	}, [
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
			premountWidth: premountWidth ?? 0,
			postmountWidth: postmountWidth ?? 0,
			renderWindowLeft: renderWindow.left - TIMELINE_PADDING,
			renderWindowWidth: renderWindow.width,
		});
	}, [marginLeft, postmountWidth, premountWidth, renderWindow, width]);
	const mediaVisualizationStyle = useMemo((): React.CSSProperties => {
		return {
			width: visibleLayout?.media?.width ?? 0,
			marginLeft: visibleLayout?.media?.left ?? 0,
			height: '100%',
		};
	}, [visibleLayout]);

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
			borderLeftColor: visibleLayout?.leftEdgeVisible
				? WHITE_ALPHA_20
				: TRANSPARENT,
			borderRightColor: visibleLayout?.rightEdgeVisible
				? WHITE_ALPHA_20
				: TRANSPARENT,
			borderTopLeftRadius: visibleLayout?.leftEdgeVisible ? 2 : 0,
			borderBottomLeftRadius: visibleLayout?.leftEdgeVisible ? 2 : 0,
			borderTopRightRadius: visibleLayout?.rightEdgeVisible ? 2 : 0,
			borderBottomRightRadius: visibleLayout?.rightEdgeVisible ? 2 : 0,
			position: 'absolute',
			height: getTimelineLayerHeight(s.type),
			marginLeft: visibleLayout?.marginLeft ?? 0,
			width: visibleLayout?.width ?? 0,
			color: WHITE,
			overflow: 'hidden',
		};
	}, [s.type, visibleLayout]);

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
			style={style}
			nodePathInfo={nodePathInfo}
			sequenceFrameOffset={sequenceFrameOffset}
			fromCanUpdate={fromCanUpdate}
			frozenFrame={frozenFrame}
			onMoveDragPointerDown={onMoveDragPointerDown}
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
						visualizationWidth={visibleLayout.media.width}
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
			nodePathInfo &&
			validatedLocation ? (
				<TimelineSequenceLeftEdgeDragHandle
					nodePathInfo={nodePathInfo}
					windowWidth={windowWidth}
					timelineDurationInFrames={video.durationInFrames ?? 1}
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
