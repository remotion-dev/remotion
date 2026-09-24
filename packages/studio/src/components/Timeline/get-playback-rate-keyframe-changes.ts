import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatusKeyframed,
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import type {
	MoveEffectKeyframeChange,
	MoveSequenceKeyframeChange,
} from './call-move-keyframe';
import {
	getKeyframedSequenceDragTargets,
	type TimelineSequenceEffectKeyframeDragTarget,
	type TimelineSequenceKeyframeDragTarget,
} from './get-keyframed-sequence-drag-targets';

type KeyframePreview = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly effectIndex: number | null;
	readonly status: CanUpdateSequencePropStatusKeyframed;
};

export const getPlaybackRateKeyframeChanges = ({
	nodePath,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	previousPlaybackRate,
	playbackRate,
}: {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly previousPlaybackRate: number;
	readonly playbackRate: number;
}): {
	readonly sequenceKeyframes: MoveSequenceKeyframeChange[];
	readonly effectKeyframes: MoveEffectKeyframeChange[];
	readonly previews: KeyframePreview[];
} => {
	const sequenceKeyframes: MoveSequenceKeyframeChange[] = [];
	const effectKeyframes: MoveEffectKeyframeChange[] = [];
	const previews: KeyframePreview[] = [];
	if (
		previousPlaybackRate === playbackRate ||
		!Number.isFinite(previousPlaybackRate) ||
		previousPlaybackRate <= 0 ||
		!Number.isFinite(playbackRate) ||
		playbackRate <= 0
	) {
		return {sequenceKeyframes, effectKeyframes, previews};
	}

	const key = stringifySequenceSubscriptionKey(nodePath);
	const root = sequences.find((sequence) => {
		const overrideId = sequence.controls?.overrideId;
		const path = overrideId ? overrideIdsToNodePaths[overrideId] : undefined;
		return path && stringifySequenceSubscriptionKey(path) === key;
	});
	if (!root) {
		return {sequenceKeyframes, effectKeyframes, previews};
	}

	const sequencesById = new Map(
		sequences.map((sequence) => [sequence.id, sequence]),
	);
	const ratio = previousPlaybackRate / playbackRate;
	const includedNodePaths = new Set<string>();

	for (const sequence of sequences) {
		let ancestorId: string | null = sequence.id;
		let belongsToRoot = false;
		let descendantOffset = 0;
		while (ancestorId !== null) {
			if (ancestorId === root.id) {
				belongsToRoot = true;
				break;
			}

			const ancestor = sequencesById.get(ancestorId);
			if (!ancestor) {
				break;
			}

			descendantOffset += ancestor.from - (ancestor.trimBefore ?? 0);
			ancestorId = ancestor.parent;
		}

		if (!belongsToRoot) {
			continue;
		}

		const overrideId = sequence.controls?.overrideId;
		const descendantNodePath = overrideId
			? overrideIdsToNodePaths[overrideId]
			: undefined;
		if (!descendantNodePath) {
			continue;
		}

		const descendantKey = stringifySequenceSubscriptionKey(descendantNodePath);
		if (includedNodePaths.has(descendantKey)) {
			continue;
		}

		includedNodePaths.add(descendantKey);
		// Local-clock descendant keyframes already follow their parent's rate.
		// The shared collector includes only outer-clock descendants.
		const targets = getKeyframedSequenceDragTargets({
			nodePath: descendantNodePath,
			sequence,
			sequences,
			propStatuses,
			isDescendant: sequence.id !== root.id,
		});

		const addMoves = (
			target:
				| TimelineSequenceKeyframeDragTarget
				| TimelineSequenceEffectKeyframeDragTarget,
			effectIndex: number | null,
		) => {
			const adjustment = target.status.keyframeDisplayOffsetAdjustment ?? 0;
			// The adjustment includes the timing offsets between this element and
			// the useCurrentFrame() binding. Remove the descendant offsets to find
			// the edited element's start in that binding's source clock.
			const anchor =
				sequence.id === root.id
					? root.from - adjustment
					: -adjustment - descendantOffset;
			if (!Number.isFinite(anchor)) {
				return;
			}

			const nextKeyframes = target.status.keyframes.map((keyframe) => {
				const frame = anchor + (keyframe.frame - anchor) * ratio;
				const nearestInteger = Math.round(frame);
				return {
					...keyframe,
					frame:
						Math.abs(frame - nearestInteger) <=
						Number.EPSILON * Math.max(1, Math.abs(frame)) * 2
							? nearestInteger
							: frame,
				};
			});
			if (
				nextKeyframes.some((keyframe) => !Number.isFinite(keyframe.frame)) ||
				new Set(nextKeyframes.map((keyframe) => keyframe.frame)).size !==
					nextKeyframes.length
			) {
				return;
			}

			const moves = target.status.keyframes.flatMap((keyframe, index) => {
				const toFrame = nextKeyframes[index]?.frame;
				if (toFrame === undefined || toFrame === keyframe.frame) {
					return [];
				}

				return [
					{
						fileName: target.fileName,
						nodePath: target.nodePath,
						fieldKey: target.fieldKey,
						fromFrame: keyframe.frame,
						toFrame,
						schema: target.schema,
					},
				];
			});
			if (moves.length === 0) {
				return;
			}

			previews.push({
				nodePath: target.nodePath,
				fieldKey: target.fieldKey,
				effectIndex,
				status: {...target.status, keyframes: nextKeyframes},
			});
			if (effectIndex === null) {
				sequenceKeyframes.push(...moves);
			} else {
				effectKeyframes.push(...moves.map((move) => ({...move, effectIndex})));
			}
		};

		for (const target of targets.sequenceKeyframes) {
			addMoves(target, null);
		}

		for (const target of targets.effectKeyframes) {
			addMoves(target, target.effectIndex);
		}
	}

	return {sequenceKeyframes, effectKeyframes, previews};
};
