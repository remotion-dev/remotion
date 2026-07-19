import React, {useCallback, useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	hasSequenceControls,
	InspectorSequenceSection,
} from '../InspectorSequenceSection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	getTimelineSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from '../Timeline/TimelineSelection';
import {AlignmentControls} from './AlignmentControls';
import {
	InspectorMessage,
	InspectorSectionDivider,
	InspectorSectionHeader,
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

const SequenceExpandedInspector: React.FC<{
	readonly track: TrackWithHash;
	readonly readOnlyStudio: boolean;
}> = ({track, readOnlyStudio}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const sourceLocation = useSequenceInspectorSourceLocation(track.sequence);
	const connectedCompositions = useConnectedCompositions({track});
	const {validatedLocation} = sourceLocation;
	const sequenceSelection = useMemo((): TimelineSelection | null => {
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
			<InspectorSectionDivider />
			<InspectorSequenceSection
				sequence={track.sequence}
				readOnlyStudio={readOnlyStudio}
				validatedLocation={validatedLocation}
				nodePathInfo={track.nodePathInfo}
				keyframeDisplayOffset={track.keyframeDisplayOffset}
				renderSectionHeader={(children) => (
					<InspectorSectionHeader>{children}</InspectorSectionHeader>
				)}
				renderTransformControls={() => <AlignmentControls track={track} />}
			/>
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
