import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {timelineNodePathInfoToKey} from './timeline-node-path-key';

export const getExpandedTrackParentKeys = (
	nodePathInfo: SequenceNodePathInfo,
): string[] => {
	const keysToExpand: string[] = [];
	const parentDepth =
		nodePathInfo.auxiliaryKeys[0] === 'effects' &&
		nodePathInfo.auxiliaryKeys.length > 2
			? 2
			: nodePathInfo.auxiliaryKeys.length;

	for (let i = 0; i < parentDepth; i++) {
		keysToExpand.push(
			timelineNodePathInfoToKey({
				...nodePathInfo,
				auxiliaryKeys: nodePathInfo.auxiliaryKeys.slice(0, i),
			}),
		);
	}

	return keysToExpand;
};
