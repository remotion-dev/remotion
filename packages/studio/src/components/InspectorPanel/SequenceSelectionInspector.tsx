import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {
	hasSequenceControls,
	InspectorSequenceSection,
} from '../InspectorSequenceSection';
import {InspectorSourceLocation} from '../InspectorSourceLocation';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	getTimelineSelectionKey,
	type TimelineSelection,
	useTimelineSelection,
} from '../Timeline/TimelineSelection';
import {useOpenSequenceInEditor} from '../Timeline/use-open-sequence-in-editor';
import {InspectorMessage, InspectorSectionHeader} from './common';
import type {SequenceSectionSelection} from './inspector-selection';
import {selectedContainer, sequenceHeader, sequenceHeaderTitle} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

const useSequenceDisplayName = (track: TrackWithHash) => {
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const nodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;

	return useMemo(() => {
		const propStatusesForOverride = nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
		const codeNameStatus = propStatusesForOverride?.name;
		const displayName =
			codeNameStatus &&
			codeNameStatus.status === 'static' &&
			typeof codeNameStatus.codeValue === 'string'
				? codeNameStatus.codeValue
				: track.sequence.displayName;

		return displayName || '<Sequence>';
	}, [nodePath, propStatuses, track.sequence.displayName]);
};

const SequenceExpandedInspector: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInEditor(track.sequence);
	const sequenceDisplayName = useSequenceDisplayName(track);
	const {documentationLink} = track.sequence;

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
	const openFileLocation = useCallback(() => {
		if (!canOpenInEditor) {
			return;
		}

		openInEditor();
	}, [canOpenInEditor, openInEditor]);
	const openDocumentationLink = useCallback(() => {
		if (!documentationLink) {
			return;
		}

		window.open(documentationLink, '_blank', 'noopener,noreferrer');
	}, [documentationLink]);
	const titleStyle = useMemo((): React.CSSProperties => {
		return {
			...sequenceHeaderTitle,
			cursor: documentationLink ? 'pointer' : 'default',
		};
	}, [documentationLink]);
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

			selectItems([sequenceSelection]);
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
			<div style={sequenceHeader}>
				{documentationLink ? (
					<button
						type="button"
						style={titleStyle}
						title="Open component docs"
						onClick={openDocumentationLink}
					>
						{sequenceDisplayName}
					</button>
				) : (
					<div style={titleStyle}>{sequenceDisplayName}</div>
				)}
				<InspectorSourceLocation
					location={validatedLocation}
					canOpen={canOpenInEditor}
					onOpen={openFileLocation}
				/>
			</div>
			<InspectorSequenceSection
				sequence={track.sequence}
				validatedLocation={validatedLocation}
				nodePathInfo={track.nodePathInfo}
				keyframeDisplayOffset={track.keyframeDisplayOffset}
				renderSectionHeader={(children) => (
					<InspectorSectionHeader>{children}</InspectorSectionHeader>
				)}
			/>
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

	return <SequenceExpandedInspector track={track} />;
};
