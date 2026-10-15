import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {findTrackForNodePathInfo} from '../Timeline/find-track-for-node-path-info';
import type {TimelineSelection} from '../Timeline/TimelineSelection';

export const useTrackForSelection = (selection: TimelineSelection | null) => {
	const sequences = Internals.useSequenceManagerSequences();
	const calculate = useTimelineCalculator();
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);

	return useMemo(() => {
		if (selection === null || selection.type === 'guide') {
			return null;
		}

		const {tracks} = calculate({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		});
		return (
			findTrackForNodePathInfo({
				tracks,
				nodePathInfo: selection.nodePathInfo,
			}) ?? null
		);
	}, [calculate, overrideIdToNodePathMappings, selection, sequences]);
};
