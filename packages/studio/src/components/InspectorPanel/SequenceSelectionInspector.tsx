import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {ScissorsIcon} from '../../icons/scissors';
import {
	hasSequenceControls,
	InspectorSequenceSection,
} from '../InspectorSequenceSection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	getTimelineSequenceSplitEligibility,
	splitTimelineSequenceFromSource,
} from '../Timeline/split-selected-timeline-item';
import {
	getTimelineSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from '../Timeline/TimelineSelection';
import {AlignmentControls} from './AlignmentControls';
import {
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
import {detailsContainer, selectedContainer} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const splitIconStyle: React.CSSProperties = {
	height: 13,
	width: 13,
};

const splitActionContainer: React.CSSProperties = {
	...detailsContainer,
	paddingBottom: 6,
	paddingTop: 6,
};

const splitActionButton: React.CSSProperties = {
	width: '100%',
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
	const onSplit = useCallback(() => {
		if (!eligibility.canSplit) {
			return;
		}

		splitTimelineSequenceFromSource({
			nodePathInfo: eligibility.nodePathInfo,
			splitFrame: timelinePosition,
		}).catch(() => undefined);
	}, [eligibility, timelinePosition]);

	if (!eligibility.canSplit) {
		return null;
	}

	return (
		<>
			<InspectorSectionDivider />
			<div style={splitActionContainer}>
				<InspectorInlineAction
					disabled={false}
					onClick={onSplit}
					style={splitActionButton}
					renderIcon={(color) => (
						<ScissorsIcon style={splitIconStyle} color={color} />
					)}
				>
					Split clip
				</InspectorInlineAction>
			</div>
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
			<SplitSequenceAction selection={sequenceSelection} track={track} />
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
