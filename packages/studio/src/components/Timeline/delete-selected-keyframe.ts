import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	callDeleteEffectKeyframe,
	callDeleteSequenceKeyframe,
} from './call-delete-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {SetCodeValues} from './save-sequence-prop';

export const deleteSelectedKeyframe = ({
	nodePathInfo,
	frame,
	sequences,
	overrideIdsToNodePaths,
	setCodeValues,
	clientId,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> | null => {
	const field = parseKeyframeFieldFromNodePath(nodePathInfo.auxiliaryKeys);
	if (field === null) {
		return null;
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo,
	});
	const sequence = track?.sequence ?? null;
	if (!sequence?.controls) {
		return null;
	}

	const sourceFrame = frame - (track?.keyframeDisplayOffset ?? 0);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const fileName = nodePath.absolutePath;

	if (field.type === 'effect') {
		const effect = sequence.effects[field.effectIndex];
		if (!effect) {
			return null;
		}

		return callDeleteEffectKeyframe({
			fileName,
			nodePath,
			effectIndex: field.effectIndex,
			fieldKey: field.fieldKey,
			sourceFrame,
			schema: effect.schema,
			setCodeValues,
			clientId,
		});
	}

	return callDeleteSequenceKeyframe({
		fileName,
		nodePath,
		fieldKey: field.fieldKey,
		sourceFrame,
		schema: sequence.controls.schema,
		setCodeValues,
		clientId,
	});
};
