import type {
	CanUpdateSequencePropStatus,
	OverrideIdToNodePaths,
	PropStatuses,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	callDeleteKeyframes,
	type DeleteEffectKeyframeChange,
	type DeleteSequenceKeyframeChange,
} from './call-delete-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {getKeyframeDisplayOffset} from './get-timeline-keyframes';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {SetPropStatuses} from './save-sequence-prop';

type SelectedKeyframeDeletion =
	| ({type: 'sequence'} & DeleteSequenceKeyframeChange)
	| ({type: 'effect'} & DeleteEffectKeyframeChange);

const getValueWhenLastKeyframeDeleted = ({
	propStatus,
	playheadSourceFrame,
}: {
	propStatus: CanUpdateSequencePropStatus | null | undefined;
	playheadSourceFrame: number;
}): unknown | null => {
	if (propStatus?.status !== 'keyframed') {
		return null;
	}

	return (
		Internals.interpolateKeyframedStatus({
			forceSpringAllowTail: null,
			frame: playheadSourceFrame,
			status: propStatus,
		}) ?? null
	);
};

const getSelectedKeyframeDeletion = ({
	nodePathInfo,
	frame,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	timelinePosition,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses;
	timelinePosition: number;
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

	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const fileName = nodePath.absolutePath;

	if (field.type === 'effect') {
		const effect = sequence.effects[field.effectIndex];
		if (!effect) {
			return null;
		}

		const effectStatus = Internals.getEffectPropStatusesCtx({
			propStatuses,
			nodePath,
			effectIndex: field.effectIndex,
		});
		const effectPropStatus =
			effectStatus?.type === 'can-update-effect'
				? effectStatus.props[field.fieldKey]
				: null;
		const effectKeyframeDisplayOffset = getKeyframeDisplayOffset({
			propStatus: effectPropStatus,
			keyframeDisplayOffset: track?.keyframeDisplayOffset ?? 0,
		});
		const effectSourceFrame = frame - effectKeyframeDisplayOffset;
		const effectPlayheadSourceFrame =
			timelinePosition - effectKeyframeDisplayOffset;
		const effectValueWhenLastKeyframeDeleted = getValueWhenLastKeyframeDeleted({
			propStatus: effectPropStatus,
			playheadSourceFrame: effectPlayheadSourceFrame,
		});

		return {
			type: 'effect',
			fileName,
			nodePath,
			effectIndex: field.effectIndex,
			fieldKey: field.fieldKey,
			sourceFrame: effectSourceFrame,
			schema: effect.schema,
			valueWhenLastKeyframeDeleted: effectValueWhenLastKeyframeDeleted,
		};
	}

	const sequencePropStatus = Internals.getPropStatusesCtx(
		propStatuses,
		nodePath,
	)?.[field.fieldKey];
	const keyframeDisplayOffset = getKeyframeDisplayOffset({
		propStatus: sequencePropStatus,
		keyframeDisplayOffset: track?.keyframeDisplayOffset ?? 0,
	});
	const sourceFrame = frame - keyframeDisplayOffset;
	const playheadSourceFrame = timelinePosition - keyframeDisplayOffset;
	const sequenceValueWhenLastKeyframeDeleted = getValueWhenLastKeyframeDeleted({
		propStatus: sequencePropStatus,
		playheadSourceFrame,
	});

	return {
		type: 'sequence',
		fileName,
		nodePath,
		fieldKey: field.fieldKey,
		sourceFrame,
		schema: sequence.controls.schema,
		valueWhenLastKeyframeDeleted: sequenceValueWhenLastKeyframeDeleted,
	};
};

export const deleteSelectedKeyframes = ({
	keyframes,
	sequences,
	overrideIdsToNodePaths,
	setPropStatuses,
	clientId,
	propStatuses,
	timelinePosition,
}: {
	keyframes: {
		nodePathInfo: SequenceNodePathInfo;
		frame: number;
	}[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setPropStatuses: SetPropStatuses;
	clientId: string;
	propStatuses: PropStatuses;
	timelinePosition: number;
}): Promise<void> | null => {
	const deletions = keyframes
		.map((keyframe) =>
			getSelectedKeyframeDeletion({
				nodePathInfo: keyframe.nodePathInfo,
				frame: keyframe.frame,
				sequences,
				overrideIdsToNodePaths,
				propStatuses,
				timelinePosition,
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
