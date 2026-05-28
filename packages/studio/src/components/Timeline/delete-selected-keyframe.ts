import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

const findTrackForNodePathInfo = ({
	sequences,
	overrideIdsToNodePaths,
	nodePathInfo,
}: {
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	nodePathInfo: SequenceNodePathInfo;
}) => {
	const tracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	return tracks.find(
		(candidate) =>
			candidate.nodePathInfo !== null &&
			stringifySequenceSubscriptionKey(
				candidate.nodePathInfo.sequenceSubscriptionKey,
			) ===
				stringifySequenceSubscriptionKey(
					nodePathInfo.sequenceSubscriptionKey,
				) &&
			candidate.nodePathInfo.index === nodePathInfo.index,
	);
};

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

		return enqueueSavePropChange({
			nodePath,
			setCodeValues,
			applyOptimistic: (prev) => prev,
			apiCall: () =>
				callApi('/api/save-effect-props', {
					fileName,
					sequenceNodePath: nodePath,
					effectIndex: field.effectIndex,
					key: field.fieldKey,
					value: '',
					defaultValue: null,
					schema: effect.schema,
					clientId,
					keyframeOperation: {
						type: 'remove',
						frame: sourceFrame,
					},
				}),
			errorLabel: 'Could not delete keyframe',
		});
	}

	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) => prev,
		apiCall: () =>
			callApi('/api/save-sequence-props', {
				fileName,
				nodePath,
				key: field.fieldKey,
				value: '',
				defaultValue: null,
				schema: sequence.controls!.schema,
				clientId,
				keyframeOperation: {
					type: 'remove',
					frame: sourceFrame,
				},
			}),
		errorLabel: 'Could not delete keyframe',
	});
};
