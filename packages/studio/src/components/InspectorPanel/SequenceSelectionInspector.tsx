import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useMediaMetadata} from '../../helpers/use-media-metadata';
import {AudioIcon} from '../../icons/audio';
import {BackgroundRemovalIcon} from '../../icons/background-removal';
import {DuplicateIcon} from '../../icons/duplicate';
import {SnowflakeIcon} from '../../icons/snowflake';
import {SplitIcon} from '../../icons/split';
import {TranscriptionIcon} from '../../icons/transcription';
import {TrashIcon} from '../../icons/trash';
import {SetSelectedModalContext} from '../../state/modals';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {
	hasSequenceControls,
	InspectorSequenceSection,
} from '../InspectorSequenceSection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {showNotification} from '../Notifications/NotificationCenter';
import {getMediaFileName} from '../public-output-name';
import {splitVideoFromAudio} from '../split-video-from-audio-api';
import {duplicateSequencesFromSource} from '../Timeline/duplicate-selected-timeline-item';
import {
	getTimelineSequenceSplitEligibility,
	splitTimelineSequenceFromSource,
} from '../Timeline/split-selected-timeline-item';
import {
	getTimelineSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from '../Timeline/TimelineSelection';
import {useDeleteTimelineItems} from '../Timeline/use-delete-timeline-items';
import {getSequenceFreezeFrameMenuItem} from '../Timeline/use-sequence-freeze-frame-menu-item';
import {AlignmentControls} from './AlignmentControls';
import {CollapsibleInspectorSection} from './CollapsibleInspectorSection';
import {
	InspectorMessage,
	InspectorQuickAction,
	InspectorQuickActionsSection,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';
import {
	ConnectedCompositionsSection,
	useConnectedCompositions,
} from './ConnectedCompositionsSection';
import type {SequenceSectionSelection} from './inspector-selection';
import {
	SequenceInspectorDuplicationSection,
	SequenceInspectorHeader,
	useSequenceInspectorSourceLocation,
} from './SequenceInspectorHeader';
import {SequenceWrapAction} from './SequenceWrapAction';
import {selectedContainer} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const SplitSequenceQuickAction: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'sequence'}>;
	readonly track: TimelineTrackData;
}> = ({selection, track}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const sequencePropStatuses = useMemo(
		() =>
			Internals.getPropStatusesCtx(
				propStatuses,
				selection.nodePathInfo.sequenceSubscriptionKey,
			),
		[propStatuses, selection],
	);
	const eligibility = useMemo(
		() =>
			getTimelineSequenceSplitEligibility({
				selection,
				sequence: track.sequence,
				splitFrame: timelinePosition,
				propStatuses: sequencePropStatuses,
			}),
		[selection, sequencePropStatuses, timelinePosition, track.sequence],
	);
	const canSplit =
		isStudioInteractivityEnabled() &&
		sequencePropStatuses !== undefined &&
		eligibility.canSplit;
	const onSplit = useCallback(() => {
		if (!canSplit || !eligibility.canSplit) {
			return;
		}

		splitTimelineSequenceFromSource({
			nodePathInfo: eligibility.nodePathInfo,
			splitFrame: timelinePosition,
		}).catch(() => undefined);
	}, [canSplit, eligibility, timelinePosition]);
	const disabledReason = !isStudioInteractivityEnabled()
		? 'Studio is read-only'
		: sequencePropStatuses === undefined
			? 'Waiting for sequence prop status'
			: eligibility.canSplit
				? undefined
				: eligibility.reason;

	return (
		<InspectorQuickAction
			disabled={!canSplit}
			iconContainerStyle={largeInspectorActionIconContainerStyle}
			onClick={onSplit}
			aria-label={disabledReason}
			renderIcon={(color) => (
				<SplitIcon style={largeInspectorActionIconStyle} color={color} />
			)}
		>
			Split clip
		</InspectorQuickAction>
	);
};

const SequenceSourceQuickActions: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'sequence'}>;
	readonly track: TimelineTrackData;
	readonly validatedSource: string;
}> = ({selection, track, validatedSource}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const confirm = useConfirmationDialog();
	const deleteTimelineItems = useDeleteTimelineItems();
	const propStatusesForOverride = useMemo(
		() =>
			Internals.getPropStatusesCtx(
				propStatuses,
				selection.nodePathInfo.sequenceSubscriptionKey,
			),
		[propStatuses, selection.nodePathInfo.sequenceSubscriptionKey],
	);
	const freezeFrameMenuItem = getSequenceFreezeFrameMenuItem({
		clientId:
			previewServerState.type === 'connected' && isStudioInteractivityEnabled()
				? previewServerState.clientId
				: null,
		nodePath: selection.nodePathInfo.sequenceSubscriptionKey,
		propStatusesForOverride,
		sequence: track.sequence,
		sequenceFrameOffset: track.sequenceFrameOffset,
		setPropStatuses,
		timelinePosition,
		validatedSource,
	});
	const sourceActionsDisabled =
		previewServerState.type !== 'connected' || !isStudioInteractivityEnabled();
	const mediaSequence =
		track.sequence.type === 'video' || track.sequence.type === 'audio'
			? track.sequence
			: null;
	const mediaMetadata = useMediaMetadata(mediaSequence?.src ?? null);
	const transcriptionDisabledReason = sourceActionsDisabled
		? 'Studio is read-only'
		: selection.nodePathInfo.numberOfSequencesWithThisNodePath > 1
			? 'Programmatically duplicated media cannot be transcribed from source'
			: undefined;
	const videoMattingDisabledReason = sourceActionsDisabled
		? 'Studio is read-only'
		: selection.nodePathInfo.numberOfSequencesWithThisNodePath > 1
			? 'Programmatically duplicated videos cannot have their background removed from source'
			: undefined;
	const onGenerateCaptions = useCallback(() => {
		if (transcriptionDisabledReason !== undefined || mediaSequence === null) {
			return;
		}

		const nodePath = selection.nodePathInfo.sequenceSubscriptionKey;
		setSelectedModal({
			type: 'transcribe',
			src: mediaSequence.src,
			displayName: getMediaFileName(
				mediaSequence.src,
				mediaSequence.displayName,
			),
			audioStreamIndex: null,
			requestInit: null,
			target: {
				fileName: nodePath.absolutePath,
				nodePath,
				durationInFrames: Number.isFinite(mediaSequence.duration)
					? mediaSequence.duration
					: null,
			},
		});
	}, [
		selection.nodePathInfo,
		setSelectedModal,
		mediaSequence,
		transcriptionDisabledReason,
	]);
	const onRemoveBackground = useCallback(() => {
		if (
			videoMattingDisabledReason !== undefined ||
			track.sequence.type !== 'video'
		) {
			return;
		}

		const nodePath = selection.nodePathInfo.sequenceSubscriptionKey;
		setSelectedModal({
			type: 'video-matting',
			src: track.sequence.src,
			displayName: getMediaFileName(
				track.sequence.src,
				track.sequence.displayName,
			),
			target: {
				fileName: nodePath.absolutePath,
				nodePath,
			},
		});
	}, [
		selection.nodePathInfo,
		setSelectedModal,
		track.sequence,
		videoMattingDisabledReason,
	]);
	const onDuplicate = useCallback(() => {
		if (sourceActionsDisabled) {
			return;
		}

		duplicateSequencesFromSource([selection.nodePathInfo], confirm).catch(
			() => undefined,
		);
	}, [confirm, selection.nodePathInfo, sourceActionsDisabled]);
	const onDelete = useCallback(() => {
		if (sourceActionsDisabled) {
			return;
		}

		deleteTimelineItems([selection]);
	}, [deleteTimelineItems, selection, sourceActionsDisabled]);
	const splitVideoFromAudioDisabledReason = sourceActionsDisabled
		? 'Studio is read-only'
		: selection.nodePathInfo.numberOfSequencesWithThisNodePath > 1
			? 'Programmatically duplicated sequences cannot be split from source'
			: undefined;
	const onSplitVideoFromAudio = useCallback(() => {
		if (splitVideoFromAudioDisabledReason !== undefined) {
			return;
		}

		const nodePath = selection.nodePathInfo.sequenceSubscriptionKey;
		splitVideoFromAudio({
			fileName: nodePath.absolutePath,
			nodePath: nodePath.nodePath,
		})
			.then((result) => {
				if (!result.success) {
					showNotification(result.reason, 4000);
				}
			})
			.catch((err) => {
				showNotification((err as Error).message, 4000);
			});
	}, [selection.nodePathInfo, splitVideoFromAudioDisabledReason]);

	// Pad the larger SVG glyphs so they have similar visible bounds at 22px.
	return (
		<>
			{freezeFrameMenuItem?.type === 'item' ? (
				<InspectorQuickAction
					disabled={Boolean(freezeFrameMenuItem.disabled)}
					iconContainerStyle={largeInspectorActionIconContainerStyle}
					onClick={() =>
						freezeFrameMenuItem.onClick(freezeFrameMenuItem.id, null)
					}
					renderIcon={(color) => (
						<SnowflakeIcon
							style={largeInspectorActionIconStyle}
							color={color}
						/>
					)}
				>
					{freezeFrameMenuItem.label}
				</InspectorQuickAction>
			) : null}
			{track.sequence.type === 'video' ? (
				<InspectorQuickAction
					disabled={videoMattingDisabledReason !== undefined}
					iconContainerStyle={largeInspectorActionIconContainerStyle}
					onClick={onRemoveBackground}
					aria-label={videoMattingDisabledReason}
					renderIcon={(color) => (
						<BackgroundRemovalIcon
							style={largeInspectorActionIconStyle}
							color={color}
							viewBox="-32 -32 704 704"
						/>
					)}
				>
					Remove background
				</InspectorQuickAction>
			) : null}
			{track.sequence.type === 'video' ? (
				<InspectorQuickAction
					disabled={splitVideoFromAudioDisabledReason !== undefined}
					iconContainerStyle={largeInspectorActionIconContainerStyle}
					onClick={onSplitVideoFromAudio}
					aria-label={splitVideoFromAudioDisabledReason}
					renderIcon={(color) => (
						<AudioIcon
							style={largeInspectorActionIconStyle}
							color={color}
							viewBox="-96 -64 704 640"
							preserveAspectRatio="none"
						/>
					)}
				>
					Split video from audio
				</InspectorQuickAction>
			) : null}
			{mediaSequence !== null && mediaMetadata?.hasAudioTrack !== false ? (
				<InspectorQuickAction
					disabled={transcriptionDisabledReason !== undefined}
					iconContainerStyle={largeInspectorActionIconContainerStyle}
					onClick={onGenerateCaptions}
					aria-label={transcriptionDisabledReason}
					renderIcon={(color) => (
						<TranscriptionIcon
							style={largeInspectorActionIconStyle}
							color={color}
							viewBox="-96 -16 704 544"
							preserveAspectRatio="none"
						/>
					)}
				>
					Generate captions
				</InspectorQuickAction>
			) : null}
			<InspectorQuickAction
				disabled={sourceActionsDisabled}
				iconContainerStyle={largeInspectorActionIconContainerStyle}
				onClick={onDuplicate}
				renderIcon={(color) => (
					<DuplicateIcon
						style={largeInspectorActionIconStyle}
						color={color}
						viewBox="-32 -32 704 704"
					/>
				)}
			>
				Duplicate
			</InspectorQuickAction>
			<SequenceWrapAction
				nodePathInfo={selection.nodePathInfo}
				sequence={track.sequence}
				sourceActionsDisabled={sourceActionsDisabled}
			/>
			<InspectorQuickAction
				disabled={sourceActionsDisabled}
				iconContainerStyle={largeInspectorActionIconContainerStyle}
				onClick={onDelete}
				renderIcon={(color) => (
					<TrashIcon
						style={largeInspectorActionIconStyle}
						color={color}
						viewBox="-120 -96 688 688"
					/>
				)}
			>
				Delete
			</InspectorQuickAction>
		</>
	);
};

const SequenceExpandedInspector: React.FC<{
	readonly track: TimelineTrackData;
	readonly readOnlyStudio: boolean;
}> = ({track, readOnlyStudio}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const sourceLocation = useSequenceInspectorSourceLocation(track.sequence);
	const connectedCompositions = useConnectedCompositions({track});
	const {validatedLocation} = sourceLocation;
	const stackKey = track.sequence.getStack();
	const sequenceSelection = useMemo((): Extract<
		TimelineSelection,
		{type: 'sequence'}
	> | null => {
		if (!track.nodePathInfo) {
			return null;
		}

		return {
			type: 'sequence',
			nodePathInfo: track.nodePathInfo,
		};
	}, [track.nodePathInfo]);
	const sequenceSelected = useMemo(() => {
		if (sequenceSelection === null || selectedItems.length !== 1) {
			return false;
		}

		return (
			getTimelineSelectionKey(selectedItems[0]) ===
			getTimelineSelectionKey(sequenceSelection)
		);
	}, [selectedItems, sequenceSelection]);
	const selectSequenceOnInspectorPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.button !== 0 || sequenceSelection === null) {
				return;
			}

			event.stopPropagation();
			if (sequenceSelected) {
				return;
			}

			selectItems([sequenceSelection], {reveal: true});
		},
		[selectItems, sequenceSelected, sequenceSelection],
	);

	if (
		previewServerState.type !== 'connected' &&
		!window.remotion_isReadOnlyStudio
	) {
		return <InspectorMessage>Studio server disconnected</InspectorMessage>;
	}

	if (
		!track.nodePathInfo ||
		sequenceSelection === null ||
		!hasSequenceControls(track.sequence)
	) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return (
		<div
			style={selectedContainer}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
			onPointerDown={selectSequenceOnInspectorPointerDown}
		>
			<SequenceInspectorHeader
				key={stackKey ?? track.sequence.id}
				sourceLocation={sourceLocation}
				track={track}
			/>
			<SequenceInspectorDuplicationSection track={track} />
			{connectedCompositions.length > 0 ? (
				<ConnectedCompositionsSection
					connectedCompositions={connectedCompositions}
				/>
			) : null}
			{validatedLocation ? (
				<>
					<InspectorSequenceSection
						sequence={track.sequence}
						readOnlyStudio={readOnlyStudio}
						validatedLocation={validatedLocation}
						nodePathInfo={track.nodePathInfo}
						keyframeDisplayOffset={track.keyframeDisplayOffset}
						keyframePlaybackRate={track.keyframePlaybackRate}
						renderTransformControls={() => <AlignmentControls track={track} />}
					/>
					<CollapsibleInspectorSection
						collapsible
						label="Actions"
						sectionId="sequence-actions"
					>
						<InspectorQuickActionsSection>
							<SplitSequenceQuickAction
								selection={sequenceSelection}
								track={track}
							/>
							<SequenceSourceQuickActions
								selection={sequenceSelection}
								track={track}
								validatedSource={validatedLocation.source}
							/>
						</InspectorQuickActionsSection>
					</CollapsibleInspectorSection>
				</>
			) : (
				<InspectorMessage>Source controls unavailable</InspectorMessage>
			)}
		</div>
	);
};

export const SequenceSelectionInspector: React.FC<{
	readonly selection: SequenceSectionSelection;
	readonly readOnlyStudio: boolean;
}> = ({selection, readOnlyStudio}) => {
	const track = useTrackForSelection(selection);

	if (!track) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return (
		<SequenceExpandedInspector track={track} readOnlyStudio={readOnlyStudio} />
	);
};
