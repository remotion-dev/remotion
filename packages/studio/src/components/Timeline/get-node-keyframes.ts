import {
	Internals,
	type CodeValues,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {getTimelineKeyframes} from './get-timeline-keyframes';

export const getNodeKeyframes = ({
	node,
	nodePath,
	codeValues,
	keyframeDisplayOffset,
}: {
	node: TimelineTreeNode;
	nodePath: SequencePropsSubscriptionKey;
	codeValues: CodeValues;
	keyframeDisplayOffset: number;
}): ReturnType<typeof getTimelineKeyframes> => {
	if (node.kind !== 'field' || node.field === null) {
		return [];
	}

	if (node.field.kind === 'sequence-field') {
		return getTimelineKeyframes(
			Internals.getCodeValuesCtx(codeValues, nodePath)?.[node.field.key],
			keyframeDisplayOffset,
		);
	}

	const effectStatus = Internals.getEffectCodeValuesCtx({
		codeValues,
		nodePath,
		effectIndex: node.field.effectIndex,
	});

	return getTimelineKeyframes(
		effectStatus.type === 'can-update-effect'
			? effectStatus.props?.[node.field.key]
			: null,
		keyframeDisplayOffset,
	);
};
