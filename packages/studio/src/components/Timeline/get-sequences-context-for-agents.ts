import {NoReactInternals} from 'remotion/no-react';
import {formatContextForAgents} from '../../helpers/format-file-location';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {getOriginalLocationFromStack} from './TimelineStack/get-stack';

export const getSequencesContextForAgents = async ({
	nodePathInfos,
	tracks,
}: {
	readonly nodePathInfos: readonly SequenceNodePathInfo[];
	readonly tracks: readonly TimelineTrackData[];
}): Promise<string | null> => {
	const contexts = await Promise.all(
		nodePathInfos.map(async (nodePathInfo) => {
			const track = findTrackForNodePathInfo({
				tracks,
				nodePathInfo,
			});
			const stack = track?.sequence.getStack() ?? null;
			if (!track || !stack) {
				return null;
			}

			const location = await getOriginalLocationFromStack(
				stack,
				'sequence',
			).catch(() => null);

			return formatContextForAgents({
				location,
				name:
					track.sequence.displayName ||
					track.sequence.controls?.componentName ||
					null,
				root: window.remotion_cwd,
			});
		}),
	);
	// Programmatically duplicated sequences share the same source location.
	const uniqueContexts = [...new Set(contexts.filter(NoReactInternals.truthy))];

	return uniqueContexts.length === 0 ? null : uniqueContexts.join('\n');
};
