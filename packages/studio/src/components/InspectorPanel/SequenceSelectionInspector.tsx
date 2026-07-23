import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
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
import {useSequenceFreezeFrameMenuItem} from '../Timeline/use-sequence-freeze-frame-menu-item';
import {AlignmentControls} from './AlignmentControls';
import {
	InspectorActionSection,
	InspectorInlineAction,
	InspectorMessage,
	InspectorSectionDivider,
} from './common';
import {
	ConnectedCompositionsSection,
	useConnectedCompositions,
} from './ConnectedCompositionsSection';
import type {SequenceSectionSelection} from './inspector-selection';
import {
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

const SplitSequenceAction: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'sequence'}>;
	readonly track: TrackWithHash;
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
		studioInteractivityEnabled &&
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
	const disabledReason = !studioInteractivityEnabled
		? 'Studio is read-only'
		: sequencePropStatuses === undefined
			? 'Waiting for sequence prop status'
			: eligibility.canSplit
				? undefined
				: eligibility.reason;

	return (
		<InspectorInlineAction
			disabled={!canSplit}
			onClick={onSplit}
			title={disabledReason}
			renderIcon={(color) => (
				<ScissorsIcon style={actionIconStyle} color={color} />
			)}
		>
			Split clip
		</InspectorInlineAction>
	);
};

const SequenceSourceActions: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'sequence'}>;
	readonly track: TrackWithHash;
	readonly validatedSource: string;
}> = ({selection, track, validatedSource}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const confirm = useConfirmationDialog();
	const propStatusesForOverride = useMemo(
		() =>
			Internals.getPropStatusesCtx(
				propStatuses,
				selection.nodePathInfo.sequenceSubscriptionKey,
			),
		[propStatuses, selection.nodePathInfo.sequenceSubscriptionKey],
	);
	const freezeFrameMenuItem = useSequenceFreezeFrameMenuItem({
		clientId:
			previewServerState.type === 'connected' && studioInteractivityEnabled
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
		previewServerState.type !== 'connected' || !studioInteractivityEnabled;
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

		deleteSequencesFromSource([selection.nodePathInfo], confirm).catch(
			() => undefined,
		);
	}, [confirm, selection.nodePathInfo, sourceActionsDisabled]);

	return (
		<>
			{freezeFrameMenuItem?.type === 'item' ? (
				<InspectorInlineAction
					disabled={Boolean(freezeFrameMenuItem.disabled)}
					onClick={() =>
						freezeFrameMenuItem.onClick(freezeFrameMenuItem.id, null)
					}
					renderIcon={(color) => (
						<SnowflakeIcon style={largeActionIconStyle} color={color} />
					)}
				>
					{freezeFrameMenuItem.label}
				</InspectorInlineAction>
			) : null}
			<InspectorInlineAction
				disabled={sourceActionsDisabled}
				onClick={onDuplicate}
				renderIcon={(color) => (
					<DuplicateIcon style={largeActionIconStyle} color={color} />
				)}
			>
				Duplicate
			</InspectorInlineAction>
			<InspectorInlineAction
				disabled={sourceActionsDisabled}
				onClick={onDelete}
				renderIcon={(color) => (
					<TrashIcon style={actionIconStyle} color={color} />
				)}
			>
				Delete
			</InspectorInlineAction>
		</>
	);
};

const SequenceExpandedInspector: React.FC<{
	readonly track: TrackWithHash;
	readonly readOnlyStudio: boolean;
}> = ({track, readOnlyStudio}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const sourceLocation = useSequenceInspectorSourceLocation(track.sequence);
	const connectedCompositions = useConnectedCompositions({track});
	const {validatedLocation} = sourceLocation;
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

	if (previewServerState.type !== 'connected') {
		return <InspectorMessage>Studio server disconnected</InspectorMessage>;
	}

	if (
		!track.nodePathInfo ||
		sequenceSelection === null ||
		!hasSequenceControls(track.sequence) ||
		!validatedLocation
	) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	return (
		<div
			style={selectedContainer}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
			onPointerDown={selectSequenceOnInspectorPointerDown}
		>
			<SequenceInspectorHeader sourceLocation={sourceLocation} track={track} />
			{connectedCompositions.length > 0 ? (
				<>
					<InspectorSectionDivider />
					<ConnectedCompositionsSection
						connectedCompositions={connectedCompositions}
					/>
				</>
			) : null}
			<InspectorSequenceSection
				sequence={track.sequence}
				readOnlyStudio={readOnlyStudio}
				validatedLocation={validatedLocation}
				nodePathInfo={track.nodePathInfo}
				keyframeDisplayOffset={track.keyframeDisplayOffset}
				renderTransformControls={() => <AlignmentControls track={track} />}
			/>
			<InspectorActionSection>
				<SplitSequenceAction selection={sequenceSelection} track={track} />
				<SequenceSourceActions
					selection={sequenceSelection}
					track={track}
					validatedSource={validatedLocation.source}
				/>
			</InspectorActionSection>
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

	const stackKey = track.sequence.getStack();

	return (
		<SequenceExpandedInspector
			key={stackKey ?? track.sequence.id}
			track={track}
			readOnlyStudio={readOnlyStudio}
		/>
	);
};
