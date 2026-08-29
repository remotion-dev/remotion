import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {AudioIcon} from '../../icons/audio';
import {DuplicateIcon} from '../../icons/duplicate';
import {ScissorsIcon} from '../../icons/scissors';
import {SnowflakeIcon} from '../../icons/snowflake';
import {TrashIcon} from '../../icons/trash';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {
	hasSequenceControls,
	InspectorSequenceSection,
} from '../InspectorSequenceSection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {showNotification} from '../Notifications/NotificationCenter';
import {splitVideoFromAudio} from '../split-video-from-audio-api';
import {deleteSequencesFromSource} from '../Timeline/delete-selected-timeline-item';
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
import {getSequenceFreezeFrameMenuItem} from '../Timeline/use-sequence-freeze-frame-menu-item';
import {AlignmentControls} from './AlignmentControls';
import {
	InspectorQuickActionsSection,
	InspectorQuickAction,
	InspectorMessage,
	InspectorSectionHeader,
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
import {selectedContainer} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const actionIconStyle: React.CSSProperties = {
	display: 'block',
	height: 16,
	width: 16,
};

const largeActionIconStyle: React.CSSProperties = {
	...actionIconStyle,
	height: 20,
	width: 20,
};

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
			onClick={onSplit}
			title={disabledReason}
			renderIcon={(color) => (
				<ScissorsIcon style={actionIconStyle} color={color} />
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
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const confirm = useConfirmationDialog();
	const {clearSelection} = useTimelineSelection();
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

		deleteSequencesFromSource([selection.nodePathInfo], confirm)
			.then((deleted) => {
				if (deleted) {
					clearSelection();
				}
			})
			.catch(() => undefined);
	}, [clearSelection, confirm, selection.nodePathInfo, sourceActionsDisabled]);
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

	return (
		<>
			{freezeFrameMenuItem?.type === 'item' ? (
				<InspectorQuickAction
					disabled={Boolean(freezeFrameMenuItem.disabled)}
					onClick={() =>
						freezeFrameMenuItem.onClick(freezeFrameMenuItem.id, null)
					}
					renderIcon={(color) => (
						<SnowflakeIcon style={largeActionIconStyle} color={color} />
					)}
				>
					{freezeFrameMenuItem.label}
				</InspectorQuickAction>
			) : null}
			{track.sequence.type === 'video' ? (
				<InspectorQuickAction
					disabled={splitVideoFromAudioDisabledReason !== undefined}
					onClick={onSplitVideoFromAudio}
					title={splitVideoFromAudioDisabledReason}
					renderIcon={(color) => (
						<AudioIcon style={actionIconStyle} color={color} />
					)}
				>
					Split video from audio
				</InspectorQuickAction>
			) : null}
			<InspectorQuickAction
				disabled={sourceActionsDisabled}
				onClick={onDuplicate}
				renderIcon={(color) => (
					<DuplicateIcon style={largeActionIconStyle} color={color} />
				)}
			>
				Duplicate
			</InspectorQuickAction>
			<InspectorQuickAction
				disabled={sourceActionsDisabled}
				onClick={onDelete}
				renderIcon={(color) => (
					<TrashIcon style={actionIconStyle} color={color} />
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
						renderTransformControls={() => <AlignmentControls track={track} />}
					/>
					<InspectorSectionHeader>Actions</InspectorSectionHeader>
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
