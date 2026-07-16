import React, {useCallback, useContext, useMemo, useRef} from 'react';
import type {TSequence} from 'remotion';
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
import {formatFileLocation} from '../../helpers/format-file-location';
import {
	getTimelineSequenceLayout,
	SEQUENCE_BORDER_WIDTH,
} from '../../helpers/get-timeline-sequence-layout';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {
	getTimelineLayerHeight,
	TIMELINE_LAYER_HEIGHT_AUDIO,
} from '../../helpers/timeline-layout';
import {useMaxMediaDuration} from '../../helpers/use-max-media-duration';
import {AudioWaveform} from '../AudioWaveform';
import {callApi} from '../call-api';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {ContextMenu} from '../ContextMenu';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSelectAsset} from '../use-select-asset';
import {disableSequenceInteractivity} from './disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {getSequenceContextMenuItems} from './get-sequence-context-menu-items';
import {LoopedTimelineIndicator} from './LoopedTimelineIndicators';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';
import {TimelineImageInfo} from './TimelineImageInfo';
import {
	shouldSelectTimelineRowOnPointerDown,
	TIMELINE_MARQUEE_ITEM_ATTR,
	useTimelineMarqueeSelectableItem,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequenceFrame} from './TimelineSequenceFrame';
import {
	TimelineSequenceLeftEdgeDragHandle,
	TimelineSequenceRightEdgeDragHandle,
	isTimelineSequenceDurationDraggable,
	useTimelineSequenceFromDrag,
} from './TimelineSequenceRightEdgeDragHandle';
import {TimelineVideoInfo} from './TimelineVideoInfo';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';
import {useSequenceFreezeFrameMenuItem} from './use-sequence-freeze-frame-menu-item';

const TimelineSequenceFn: React.FC<{
	readonly s: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
}> = ({s, nodePathInfo, sequenceFrameOffset}) => {
	const windowWidth = useContext(TimelineWidthContext);

	if (windowWidth === null) {
		return null;
	}

	return (
		<TimelineSequenceInner
			windowWidth={windowWidth}
			s={s}
			nodePathInfo={nodePathInfo}
			sequenceFrameOffset={sequenceFrameOffset}
		/>
	);
};

const TimelineSequenceCurrentFrame: React.FC<{
	readonly s: TSequence;
	readonly displayDurationInFrames: number;
	readonly premountWidth: number | null;
	readonly postmountWidth: number | null;
	readonly style: React.CSSProperties;
	readonly children: React.ReactNode;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
	readonly fromCanUpdate: boolean;
	readonly frozenFrame: number | null;
	readonly onMoveDragPointerDown: (
		e: React.PointerEvent<HTMLDivElement>,
	) => void;
}> = ({
	s,
	displayDurationInFrames,
	premountWidth,
	postmountWidth,
	style,
	children,
	nodePathInfo,
	sequenceFrameOffset,
	fromCanUpdate,
	frozenFrame,
	onMoveDragPointerDown,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const {onSelect, selectable, selected, selectionItem} =
		useTimelineRowSelection(nodePathInfo);
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
			opacity: isInRange ? 1 : 0.5,
		};
	}, [isInRange, style]);

	return (
		<div
			ref={ref}
			{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
			style={actualStyle}
			title={s.displayName}
			onPointerDown={selectable ? onPointerDown : undefined}
		>
			{premountWidth ? (
				<div
					style={{
						width: premountWidth,
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

			{postmountWidth ? (
				<div
					style={{
						width: postmountWidth,
						height: '100%',
						background: `repeating-linear-gradient(
								-45deg,
								${TRANSPARENT},
								${TRANSPARENT} 2px,
								${isPostmounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 2px,
								${isPostmounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 4px
							)`,
						position: 'absolute',
						right: 0,
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
						paddingLeft: 5 + (premountWidth ?? 0),
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
	readonly windowWidth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly sequenceFrameOffset: number;
}> = ({s, windowWidth, nodePathInfo, sequenceFrameOffset}) => {
	// If a duration is 1, it is essentially a still and it should have width 0
	// Some compositions may not be longer than their media duration,
	// if that is the case, it needs to be asynchronously determined

	const video = Internals.useVideo();

	const maxMediaDuration = useMaxMediaDuration(s, video?.fps ?? 30);
	const effectiveMaxMediaDuration = s.loopDisplay ? null : maxMediaDuration;

	const originalLocation = useResolveStackAndReactToChange(s.getStack);
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
		studioInteractivityEnabled &&
		propStatusesForOverride?.durationInFrames?.status === 'static',
	);
	const fromCanUpdate = Boolean(
		studioInteractivityEnabled &&
		propStatusesForOverride?.from?.status === 'static',
	);
	const trimBeforeCanUpdate = Boolean(
		studioInteractivityEnabled &&
		propStatusesForOverride?.trimBefore?.status === 'static',
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && studioInteractivityEnabled;
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const selectAsset = useSelectAsset();
	const confirm = useConfirmationDialog();
	const {onSelect, selectable} = useTimelineRowSelection(nodePathInfo);
	const fileLocation = useMemo(
		() =>
			formatFileLocation({
				location: originalLocation,
				root: window.remotion_cwd,
			}),
		[originalLocation],
	);
	const canOpenInEditor = Boolean(
		window.remotion_editorName && previewConnected && originalLocation,
	);
	const openInEditor = useCallback(() => {
		if (!canOpenInEditor || !originalLocation) {
			return;
		}

		openOriginalPositionInEditor(originalLocation).catch((err) => {
			showNotification((err as Error).message, 2000);
		});
	}, [canOpenInEditor, originalLocation]);
	const canDeleteFromSource = Boolean(nodePath && validatedLocation?.source);
	const deleteDisabled =
		!previewInteractive || !s.controls || !canDeleteFromSource;
	const duplicateDisabled = deleteDisabled;
	const disableInteractivityDisabled =
		!previewInteractive ||
		!s.showInTimeline ||
		!nodePath ||
		!validatedLocation?.source;
	const mediaSrc =
		s.type === 'audio' || s.type === 'video' || s.type === 'image'
			? s.src
			: null;
	const assetLinkInfo = useMemo(
		() => (mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null),
		[mediaSrc],
	);
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
			const result = await callApi('/api/delete-jsx-node', {
				nodes: [
					{
						fileName: validatedLocation.source,
						nodePath: nodePath.nodePath,
					},
				],
			});
			if (result.success) {
				showNotification('Removed sequence from source file', 2000);
			} else {
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
	const freezeFrameMenuItem = useSequenceFreezeFrameMenuItem({
		clientId:
			previewInteractive && previewServerState.type === 'connected'
				? previewServerState.clientId
				: null,
		nodePath,
		propStatusesForOverride,
		sequence: s,
		sequenceFrameOffset,
		setPropStatuses,
		timelinePosition,
		validatedSource: validatedLocation?.source ?? null,
	});
	const contextMenuValues = useMemo(() => {
		if (!previewConnected) {
			return [];
		}

		return getSequenceContextMenuItems({
			assetLinkInfo,
			canOpenInEditor,
			deleteDisabled,
			disableInteractivityDisabled,
			duplicateDisabled,
			fileLocation,
			includeSourceEditItems: studioInteractivityEnabled,
			onDeleteSequenceFromSource,
			onDisableSequenceInteractivity,
			onDuplicateSequenceFromSource,
			openInEditor,
			originalLocation,
			selectAsset,
			sequence: s,
			sourceActions:
				studioInteractivityEnabled && freezeFrameMenuItem
					? [freezeFrameMenuItem]
					: [],
		});
	}, [
		assetLinkInfo,
		canOpenInEditor,
		deleteDisabled,
		disableInteractivityDisabled,
		duplicateDisabled,
		fileLocation,
		freezeFrameMenuItem,
		onDeleteSequenceFromSource,
		onDisableSequenceInteractivity,
		onDuplicateSequenceFromSource,
		openInEditor,
		originalLocation,
		previewConnected,
		s,
		selectAsset,
	]);
	const onContextMenuOpen = useCallback(() => {
		if (selectable) {
			onSelect({shiftKey: false, toggleKey: false});
		}
	}, [onSelect, selectable]);
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

	const {marginLeft, width, naturalWidth, premountWidth, postmountWidth} =
		useMemo(() => {
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
			borderRadius: 2,
			position: 'absolute',
			height: getTimelineLayerHeight(s.type),
			marginLeft,
			width,
			color: WHITE,
			overflow: 'hidden',
		};
	}, [marginLeft, s.type, width]);

	const showRightEdgeDragHandle =
		isTimelineSequenceDurationDraggable(s) &&
		nodePath !== null &&
		validatedLocation !== null &&
		durationCanUpdate;
	const showLeftEdgeDragHandle =
		(s.type === 'sequence' ||
			s.type === 'image' ||
			s.type === 'audio' ||
			s.type === 'video') &&
		!s.isInsideSeries &&
		nodePath !== null &&
		validatedLocation !== null &&
		Boolean(s.controls) &&
		fromCanUpdate &&
		durationCanUpdate &&
		trimBeforeCanUpdate;

	if (maxMediaDuration === null && !s.loopDisplay) {
		return null;
	}

	const sequence = (
		<TimelineSequenceCurrentFrame
			s={s}
			displayDurationInFrames={displayDurationInFrames}
			premountWidth={premountWidth}
			postmountWidth={postmountWidth}
			style={style}
			nodePathInfo={nodePathInfo}
			sequenceFrameOffset={sequenceFrameOffset}
			fromCanUpdate={fromCanUpdate}
			frozenFrame={frozenFrame}
			onMoveDragPointerDown={onMoveDragPointerDown}
		>
			{s.type === 'audio' ? (
				<AudioWaveform
					src={s.src}
					height={TIMELINE_LAYER_HEIGHT_AUDIO}
					doesVolumeChange={s.doesVolumeChange}
					visualizationWidth={width}
					startFrom={s.startMediaFrom}
					durationInFrames={s.duration}
					volume={s.volume}
					playbackRate={s.playbackRate}
					loopDisplay={s.loopDisplay}
				/>
			) : null}
			{s.type === 'video' ? (
				<TimelineVideoInfo
					src={s.src}
					visualizationWidth={width}
					naturalWidth={naturalWidth}
					trimBefore={s.startMediaFrom}
					durationInFrames={s.duration}
					playbackRate={s.playbackRate}
					volume={s.volume}
					doesVolumeChange={s.doesVolumeChange}
					premountWidth={premountWidth ?? 0}
					postmountWidth={postmountWidth ?? 0}
					loopDisplay={s.loopDisplay}
					frozenMediaFrame={s.frozenMediaFrame}
				/>
			) : null}
			{s.type === 'image' ? (
				<TimelineImageInfo src={s.src} visualizationWidth={width} />
			) : null}
			{s.loopDisplay === undefined ? null : (
				<LoopedTimelineIndicator loops={s.loopDisplay.numberOfTimes} />
			)}
			{showLeftEdgeDragHandle && nodePathInfo && validatedLocation ? (
				<TimelineSequenceLeftEdgeDragHandle
					nodePathInfo={nodePathInfo}
					windowWidth={windowWidth}
					timelineDurationInFrames={video.durationInFrames ?? 1}
				/>
			) : null}
			{showRightEdgeDragHandle && nodePathInfo && validatedLocation ? (
				<TimelineSequenceRightEdgeDragHandle
					nodePathInfo={nodePathInfo}
					windowWidth={windowWidth}
					timelineDurationInFrames={video.durationInFrames ?? 1}
				/>
			) : null}
		</TimelineSequenceCurrentFrame>
	);

	return previewConnected ? (
		<ContextMenu values={contextMenuValues} onOpen={onContextMenuOpen}>
			{sequence}
		</ContextMenu>
	) : (
		sequence
	);
};

export const TimelineSequence = React.memo(TimelineSequenceFn);
