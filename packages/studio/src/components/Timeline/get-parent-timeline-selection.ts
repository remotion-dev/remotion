import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {TimelineSelection} from './TimelineSelection';

export const getParentTimelineSelection = (
	item: TimelineSelection,
): TimelineSelection | null => {
	if (item.type === 'sequence' || item.type === 'guide') {
		return null;
	}

	const nodePathInfo = {...item.nodePathInfo, auxiliaryKeys: []};
	if (item.type === 'keyframe' || item.type === 'easing') {
		const field = parseKeyframeFieldFromNodePath(
			item.nodePathInfo.auxiliaryKeys,
		);
		if (field?.type === 'sequence') {
			return {
				type: 'sequence-prop',
				nodePathInfo: item.nodePathInfo,
				key: field.fieldKey,
			};
		}

		if (field?.type === 'effect') {
			return {
				type: 'sequence-effect-prop',
				nodePathInfo: item.nodePathInfo,
				i: field.effectIndex,
				key: field.fieldKey,
			};
		}
	}

	return {type: 'sequence', nodePathInfo};
};
