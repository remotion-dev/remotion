import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {findTrackForNodePathInfo} from '../Timeline/find-track-for-node-path-info';
import type {TimelineSelection} from '../Timeline/TimelineSelection';

export const useTrackForSelection = (selection: TimelineSelection) => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	return useMemo(() => {
		if (selection.type === 'guide') {
			return null;
		}

		return (
			findTrackForNodePathInfo({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				nodePathInfo: selection.nodePathInfo,
			}) ?? null
		);
	}, [overrideIdToNodePathMappings, selection, sequences]);
};
