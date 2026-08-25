import type {_InternalTypes, OverrideIdToNodePaths, TSequence} from 'remotion';
import {calculateTimeline} from './calculate-timeline';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {getCanvasSequenceSelectionKey} from './selection';

export type CanvasSelectableOutline = {
	readonly depth: number;
	readonly keyframeDisplayOffset: number;
	readonly key: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
};

export const getCanvasSelectableOutlines = ({
	sequences,
	overrideIdsToNodePaths,
	compositions = [],
	timelinePosition,
}: {
	readonly sequences: readonly TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly compositions?: readonly _InternalTypes['AnyComposition'][];
	readonly timelinePosition: number;
}): CanvasSelectableOutline[] => {
	return calculateTimeline({
		sequences: [...sequences],
		overrideIdsToNodePaths,
		compositions,
	})
		.filter((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return (
				track.sequence.showInTimeline &&
				timelinePosition >= track.sequence.from &&
				timelinePosition < track.sequence.from + track.sequence.duration &&
				track.nodePathInfo.auxiliaryKeys.length === 0
			);
		})
		.filter((track) => track.sequence.refForOutline !== null)
		.sort((a, b) => a.depth - b.depth)
		.map((track) => {
			if (track.nodePathInfo === null) {
				throw new Error('Expected selected outline to have a node path');
			}

			return {
				depth: track.depth,
				keyframeDisplayOffset: track.keyframeDisplayOffset,
				key: getCanvasSequenceSelectionKey(track.nodePathInfo),
				nodePathInfo: track.nodePathInfo,
				sequence: track.sequence,
			};
		});
};
