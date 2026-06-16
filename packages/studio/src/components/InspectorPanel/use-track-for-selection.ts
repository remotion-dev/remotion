import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {findTrackForNodePathInfo} from '../Timeline/find-track-for-node-path-info';
import type {TimelineSelection} from '../Timeline/TimelineSelection';
import {findTrackForInspectorSelection} from './find-track-for-inspector-selection';
import {isSequenceSectionSelection} from './inspector-selection';

export const useTrackForSelection = (selection: TimelineSelection) => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	return useMemo(() => {
		if (selection.type === 'guide') {
			return null;
		}

		const strictTrack = findTrackForNodePathInfo({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			nodePathInfo: selection.nodePathInfo,
		});
		if (strictTrack) {
			return strictTrack;
		}

		if (!isSequenceSectionSelection(selection)) {
			return null;
		}

		return (
			findTrackForInspectorSelection({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				selection,
			}) ?? null
		);
	}, [overrideIdToNodePathMappings, selection, sequences]);
};
