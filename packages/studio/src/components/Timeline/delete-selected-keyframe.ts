import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	callDeleteEffectKeyframe,
	callDeleteKeyframes,
	callDeleteSequenceKeyframe,
	type DeleteEffectKeyframeChange,
	type DeleteSequenceKeyframeChange,
} from './call-delete-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {SetPropStatuses} from './save-sequence-prop';

type SelectedKeyframeDeletion =
	| ({type: 'sequence'} & DeleteSequenceKeyframeChange)
	| ({type: 'effect'} & DeleteEffectKeyframeChange);

const getSelectedKeyframeDeletion = ({
	nodePathInfo,
	frame,
	sequences,
	overrideIdsToNodePaths,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
}): SelectedKeyframeDeletion | null => {
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

		return {
			type: 'effect',
			fileName,
			nodePath,
			effectIndex: field.effectIndex,
			fieldKey: field.fieldKey,
			sourceFrame,
			schema: effect.schema,
		};
	}

	return {
		type: 'sequence',
		fileName,
		nodePath,
		fieldKey: field.fieldKey,
		sourceFrame,
		schema: sequence.controls.schema,
	};
};

export const deleteSelectedKeyframe = ({
	nodePathInfo,
	frame,
	sequences,
	overrideIdsToNodePaths,
	setPropStatuses,
	clientId,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> | null => {
	const deletion = getSelectedKeyframeDeletion({
		nodePathInfo,
		frame,
		sequences,
		overrideIdsToNodePaths,
	});
	if (deletion === null) {
		return null;
	}

	if (deletion.type === 'effect') {
		return callDeleteEffectKeyframe({
			...deletion,
			setPropStatuses,
			clientId,
		});
	}

	return callDeleteSequenceKeyframe({
		...deletion,
		setPropStatuses,
		clientId,
	});
};

export const deleteSelectedKeyframes = ({
	keyframes,
	sequences,
	overrideIdsToNodePaths,
	setPropStatuses,
	clientId,
}: {
	keyframes: {
		nodePathInfo: SequenceNodePathInfo;
		frame: number;
	}[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> | null => {
	const deletions = keyframes
		.map((keyframe) =>
			getSelectedKeyframeDeletion({
				nodePathInfo: keyframe.nodePathInfo,
				frame: keyframe.frame,
				sequences,
				overrideIdsToNodePaths,
			}),
		)
		.filter(
			(deletion): deletion is SelectedKeyframeDeletion => deletion !== null,
		);

	if (deletions.length === 0) {
		return null;
	}

	return callDeleteKeyframes({
		sequenceKeyframes: deletions.filter(
			(
				deletion,
			): deletion is SelectedKeyframeDeletion & {
				type: 'sequence';
			} => deletion.type === 'sequence',
		),
		effectKeyframes: deletions.filter(
			(
				deletion,
			): deletion is SelectedKeyframeDeletion & {
				type: 'effect';
			} => deletion.type === 'effect',
		),
		setPropStatuses,
		clientId,
	});
};
