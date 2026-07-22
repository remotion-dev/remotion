import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {ScissorsIcon} from '../../icons/scissors';
import {SnowflakeIcon} from '../../icons/snowflake';
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

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
const DuplicateIcon: React.FC<{readonly color: string}> = ({color}) => (
	<svg viewBox="0 0 640 640" style={largeActionIconStyle} fill={color}>
		<path d="M352 544L128 544C110.3 544 96 529.7 96 512L96 288C96 270.3 110.3 256 128 256L176 256L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L384 464L384 512C384 529.7 369.7 544 352 544zM288 384C270.3 384 256 369.7 256 352L256 128C256 110.3 270.3 96 288 96L512 96C529.7 96 544 110.3 544 128L544 352C544 369.7 529.7 384 512 384L288 384zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z" />
	</svg>
);

const TrashIcon: React.FC<{readonly color: string}> = ({color}) => (
	<svg viewBox="0 0 448 512" style={actionIconStyle} fill={color}>
		<path d="M160.5 27.4C162.5 20.6 168.8 16 175.8 16h96.4c7.1 0 13.3 4.6 15.3 11.4l11 36.6h-149l11-36.6zM116.1 64H16C7.2 64 0 71.2 0 80s7.2 16 16 16h416c8.8 0 16-7.2 16-16s-7.2-16-16-16H331.9l-13.7-45.8C312.1-2.1 293.4-16 272.2-16h-96.4c-21.2 0-39.9 13.9-46 34.2L116.1 64zM28.7 144l22.9 308.7c2.5 33.4 30.3 59.3 63.8 59.3h217.1c33.5 0 61.3-25.9 63.8-59.3L419.2 144h-32.1l-22.7 306.4c-1.2 16.7-15.2 29.6-31.9 29.6H115.4c-16.8 0-30.7-12.9-31.9-29.6L60.8 144H28.7z" />
	</svg>
);

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
				renderIcon={(color) => <DuplicateIcon color={color} />}
			>
				Duplicate
			</InspectorInlineAction>
			<InspectorInlineAction
				disabled={sourceActionsDisabled}
				onClick={onDelete}
				renderIcon={(color) => <TrashIcon color={color} />}
			>
				Delete
			</InspectorInlineAction>
		</>
	);
};

const SequenceExpandedInspector: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
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
}> = ({selection}) => {
	const track = useTrackForSelection(selection);

	if (!track) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	const stackKey = track.sequence.getStack();

	return (
		<SequenceExpandedInspector
			key={stackKey ?? track.sequence.id}
			track={track}
		/>
	);
};
