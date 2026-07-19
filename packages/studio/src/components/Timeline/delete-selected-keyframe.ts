import type {
	CanUpdateSequencePropStatus,
	OverrideIdToNodePaths,
	PropStatuses,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
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

const getValueWhenLastKeyframeDeleted = ({
	propStatus,
	playheadSourceFrame,
}: {
	propStatus: CanUpdateSequencePropStatus | null | undefined;
	playheadSourceFrame: number | null;
}): unknown | null => {
	if (propStatus?.status !== 'keyframed' || playheadSourceFrame === null) {
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
	propStatuses: PropStatuses | null;
	timelinePosition: number | null;
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
	const playheadSourceFrame =
		timelinePosition === null
			? null
			: timelinePosition - (track?.keyframeDisplayOffset ?? 0);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const fileName = nodePath.absolutePath;

	if (field.type === 'effect') {
		const effect = sequence.effects[field.effectIndex];
		if (!effect) {
			return null;
		}

		const effectStatus =
			propStatuses !== null
				? Internals.getEffectPropStatusesCtx({
						propStatuses,
						nodePath,
						effectIndex: field.effectIndex,
					})
				: null;
		const effectPropStatus =
			effectStatus?.type === 'can-update-effect'
				? effectStatus.props[field.fieldKey]
				: null;
		const effectValueWhenLastKeyframeDeleted = getValueWhenLastKeyframeDeleted({
			propStatus: effectPropStatus,
			playheadSourceFrame,
		});

		return {
			type: 'effect',
			fileName,
			nodePath,
			effectIndex: field.effectIndex,
			fieldKey: field.fieldKey,
			sourceFrame,
			schema: effect.schema,
			valueWhenLastKeyframeDeleted: effectValueWhenLastKeyframeDeleted,
		};
	}

	const sequencePropStatus =
		propStatuses !== null
			? Internals.getPropStatusesCtx(propStatuses, nodePath)?.[field.fieldKey]
			: null;
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
		propStatuses: null,
		timelinePosition: null,
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
