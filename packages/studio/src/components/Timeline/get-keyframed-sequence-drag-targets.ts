import {CanvasInternals} from '@remotion/canvas';
import type {
	CanUpdateSequencePropStatusKeyframed,
	InteractivitySchema,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';

const {getParentSequencePlaybackRate} = CanvasInternals;

export type TimelineSequenceKeyframeDragTarget = {
	readonly parentPlaybackRate: number;
	readonly fileName: string;
	readonly fieldKey: string;
	readonly isDescendant: boolean;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly status: CanUpdateSequencePropStatusKeyframed;
};

export type TimelineSequenceEffectKeyframeDragTarget =
	TimelineSequenceKeyframeDragTarget & {
		readonly effectIndex: number;
	};

export const getKeyframedSequenceDragTargets = ({
	nodePath,
	sequence,
	sequences,
	propStatuses,
	isDescendant,
}: {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly sequence: TSequence;
	readonly sequences: TSequence[];
	readonly propStatuses: PropStatuses;
	readonly isDescendant: boolean;
}): {
	readonly effectKeyframes: TimelineSequenceEffectKeyframeDragTarget[];
	readonly sequenceKeyframes: TimelineSequenceKeyframeDragTarget[];
} => {
	const status =
		propStatuses[Internals.makeSequencePropsSubscriptionKey(nodePath)];
	if (status === null || status === undefined || !status.canUpdate) {
		return {effectKeyframes: [], sequenceKeyframes: []};
	}

	const sequenceSchema = sequence.controls?.schema;
	const sequenceKeyframes =
		sequenceSchema === undefined
			? []
			: Object.entries(status.props).flatMap(([fieldKey, propStatus]) =>
					propStatus.status === 'keyframed' &&
					(!isDescendant || propStatus.keyframeDisplayOffsetAdjustment !== null)
						? [
								{
									parentPlaybackRate: getParentSequencePlaybackRate(
										sequence,
										sequences,
									),
									fileName: nodePath.absolutePath,
									fieldKey,
									isDescendant,
									nodePath,
									schema: sequenceSchema,
									status: propStatus,
								},
							]
						: [],
				);

	const effectKeyframes = status.effects.flatMap((effectStatus) => {
		if (!effectStatus.canUpdate) {
			return [];
		}

		const effectSchema = sequence.effects[effectStatus.effectIndex]?.schema;
		if (effectSchema === undefined) {
			return [];
		}

		return Object.entries(effectStatus.props).flatMap(
			([fieldKey, propStatus]) =>
				propStatus.status === 'keyframed' &&
				(!isDescendant || propStatus.keyframeDisplayOffsetAdjustment !== null)
					? [
							{
								effectIndex: effectStatus.effectIndex,
								parentPlaybackRate: getParentSequencePlaybackRate(
									sequence,
									sequences,
								),
								fileName: nodePath.absolutePath,
								fieldKey,
								isDescendant,
								nodePath,
								schema: effectSchema,
								status: propStatus,
							},
						]
					: [],
		);
	});

	return {effectKeyframes, sequenceKeyframes};
};
