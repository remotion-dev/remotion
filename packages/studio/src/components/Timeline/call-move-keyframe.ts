import {
	optimisticMoveEffectKeyframes,
	optimisticMoveSequenceKeyframes,
	type MoveKeyframesRequest,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatus,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {callApi} from '../call-api';
import type {SetPropStatuses} from './save-sequence-prop';

export type MoveSequenceKeyframeChange = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	fromFrame: number;
	toFrame: number;
	schema: InteractivitySchema;
	keyframeDisplayOffsetAdjustmentDelta?: number;
};

export type MoveEffectKeyframeChange = MoveSequenceKeyframeChange & {
	effectIndex: number;
};

const moveKeyframes = (request: MoveKeyframesRequest) => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return callApi('/api/move-keyframes', request);
	}

	return browserStudioOperations.keyframes
		? browserStudioOperations.keyframes.moveKeyframes(request)
		: Promise.reject(new Error('Keyframe editing is unavailable'));
};

const groupByNodePath = <T extends {nodePath: SequencePropsSubscriptionKey}>(
	keyframes: T[],
): T[][] => {
	const groups = new Map<string, T[]>();
	for (const keyframe of keyframes) {
		const key = JSON.stringify(keyframe.nodePath);
		const group = groups.get(key) ?? [];
		group.push(keyframe);
		groups.set(key, group);
	}

	return [...groups.values()];
};

const applyKeyframeDisplayOffsetAdjustmentDeltas = ({
	props,
	keyframes,
}: {
	readonly props: Record<string, CanUpdateSequencePropStatus>;
	readonly keyframes: readonly MoveSequenceKeyframeChange[];
}) => {
	const nextProps = {...props};
	const deltas = new Map<string, number>();
	for (const keyframe of keyframes) {
		if (keyframe.keyframeDisplayOffsetAdjustmentDelta !== undefined) {
			deltas.set(
				keyframe.fieldKey,
				keyframe.keyframeDisplayOffsetAdjustmentDelta,
			);
		}
	}

	for (const [fieldKey, delta] of deltas) {
		const status = nextProps[fieldKey];
		if (
			status?.status !== 'keyframed' ||
			status.keyframeDisplayOffsetAdjustment === null
		) {
			continue;
		}

		nextProps[fieldKey] = {
			...status,
			keyframeDisplayOffsetAdjustment:
				status.keyframeDisplayOffsetAdjustment + delta,
		};
	}

	return nextProps;
};

export const applyOptimisticKeyframeMoves = ({
	sequenceKeyframes,
	effectKeyframes,
	setPropStatuses,
}: {
	sequenceKeyframes: MoveSequenceKeyframeChange[];
	effectKeyframes: MoveEffectKeyframeChange[];
	setPropStatuses: SetPropStatuses;
}) => {
	if (sequenceKeyframes.length === 0 && effectKeyframes.length === 0) {
		return;
	}

	for (const keyframes of groupByNodePath(sequenceKeyframes)) {
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setPropStatuses(firstKeyframe.nodePath, (prev) => {
			const moved = optimisticMoveSequenceKeyframes({
				previous: prev,
				keyframes: keyframes.map((keyframe) => ({
					fieldKey: keyframe.fieldKey,
					fromFrame: keyframe.fromFrame,
					toFrame: keyframe.toFrame,
				})),
			});
			if (!moved.canUpdate) {
				return moved;
			}

			return {
				...moved,
				props: applyKeyframeDisplayOffsetAdjustmentDeltas({
					props: moved.props,
					keyframes,
				}),
			};
		});
	}

	for (const keyframes of groupByNodePath(effectKeyframes)) {
		const [firstKeyframe] = keyframes;
		if (!firstKeyframe) {
			continue;
		}

		setPropStatuses(firstKeyframe.nodePath, (prev) => {
			const moved = optimisticMoveEffectKeyframes({
				previous: prev,
				keyframes: keyframes.map((keyframe) => ({
					effectIndex: keyframe.effectIndex,
					fieldKey: keyframe.fieldKey,
					fromFrame: keyframe.fromFrame,
					toFrame: keyframe.toFrame,
				})),
			});
			if (!moved.canUpdate) {
				return moved;
			}

			return {
				...moved,
				effects: moved.effects.map((effect) => {
					if (!effect.canUpdate) {
						return effect;
					}

					return {
						...effect,
						props: applyKeyframeDisplayOffsetAdjustmentDeltas({
							props: effect.props,
							keyframes: keyframes.filter(
								(keyframe) => keyframe.effectIndex === effect.effectIndex,
							),
						}),
					};
				}),
			};
		});
	}
};

export const callMoveKeyframes = ({
	sequenceKeyframes,
	effectKeyframes,
	setPropStatuses,
	clientId,
}: {
	sequenceKeyframes: MoveSequenceKeyframeChange[];
	effectKeyframes: MoveEffectKeyframeChange[];
	setPropStatuses: SetPropStatuses;
	clientId: string;
}): Promise<void> => {
	if (sequenceKeyframes.length === 0 && effectKeyframes.length === 0) {
		return Promise.resolve();
	}

	applyOptimisticKeyframeMoves({
		sequenceKeyframes,
		effectKeyframes,
		setPropStatuses,
	});

	return moveKeyframes({
		sequenceKeyframes: sequenceKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			nodePath: keyframe.nodePath,
			key: keyframe.fieldKey,
			fromFrame: keyframe.fromFrame,
			toFrame: keyframe.toFrame,
			schema: keyframe.schema,
		})),
		effectKeyframes: effectKeyframes.map((keyframe) => ({
			fileName: keyframe.fileName,
			sequenceNodePath: keyframe.nodePath,
			effectIndex: keyframe.effectIndex,
			key: keyframe.fieldKey,
			fromFrame: keyframe.fromFrame,
			toFrame: keyframe.toFrame,
			schema: keyframe.schema,
		})),
		clientId,
	}).then(() => undefined);
};
