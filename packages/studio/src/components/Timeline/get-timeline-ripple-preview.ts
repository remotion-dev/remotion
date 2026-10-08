import {CanvasInternals} from '@remotion/sdk';
import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {
	OverrideIdToNodePaths,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';

export const createTimelineRipplePreview = ({
	sequences,
	overrideIdsToNodePaths,
	nodePath,
	initialDuration,
	timelineDurationInFrames,
}: {
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly initialDuration: number;
	readonly timelineDurationInFrames: number;
}): {
	readonly sequenceId: string;
	readonly project: (nextDuration: number) => TSequence[] | null;
} | null => {
	const nodeKey = stringifySequenceSubscriptionKey(nodePath);
	const matchingSequences = sequences.filter((sequence) => {
		const overrideId = sequence.controls?.overrideId;
		const mapping = overrideId ? overrideIdsToNodePaths[overrideId] : null;
		return mapping && stringifySequenceSubscriptionKey(mapping) === nodeKey;
	});
	const target = matchingSequences[0];
	if (
		matchingSequences.length !== 1 ||
		!target ||
		target.controls?.componentIdentity !==
			'dev.remotion.remotion.Series.Sequence' ||
		target.intrinsicDuration !== initialDuration ||
		!Number.isFinite(initialDuration) ||
		initialDuration <= 0 ||
		!Number.isFinite(timelineDurationInFrames) ||
		timelineDurationInFrames <= 0
	) {
		return null;
	}

	const byId = new Map(sequences.map((sequence) => [sequence.id, sequence]));
	const parent = target.parent === null ? null : byId.get(target.parent);
	if (
		byId.size !== sequences.length ||
		parent?.controls?.componentIdentity !== 'dev.remotion.remotion.Series'
	) {
		return null;
	}

	const ordered: TSequence[] = [];
	const visited = new Set<string>();
	const visiting = new Set<string>();
	const visit = (sequence: TSequence): boolean => {
		if (visited.has(sequence.id)) {
			return true;
		}

		if (visiting.has(sequence.id)) {
			return false;
		}

		visiting.add(sequence.id);
		if (sequence.parent !== null) {
			const sequenceParent = byId.get(sequence.parent);
			if (!sequenceParent || !visit(sequenceParent)) {
				return false;
			}
		}

		visiting.delete(sequence.id);
		visited.add(sequence.id);
		ordered.push(sequence);
		return true;
	};

	if (!sequences.every(visit)) {
		return null;
	}

	const siblings = CanvasInternals.sortItemsByCommitOrder(
		sequences.filter(
			(sequence) =>
				sequence.parent === target.parent &&
				sequence.controls?.componentIdentity ===
					'dev.remotion.remotion.Series.Sequence',
		),
		(sequence) => sequence.timelineOrder,
	);
	const shifted = new Set(
		siblings.slice(siblings.indexOf(target) + 1).map((sequence) => sequence.id),
	);
	const affected = new Set([target.id, ...shifted]);
	const ancestors = new Set<string>();
	let ancestor: TSequence | undefined = parent;
	while (ancestor) {
		ancestors.add(ancestor.id);
		ancestor = ancestor.parent === null ? undefined : byId.get(ancestor.parent);
	}

	for (const sequence of ordered) {
		if (sequence.parent !== null && affected.has(sequence.parent)) {
			affected.add(sequence.id);
		}

		if (!affected.has(sequence.id) && !ancestors.has(sequence.id)) {
			continue;
		}

		if (
			sequence.loopDisplay ||
			sequence.frozenFrame !== null ||
			!Number.isFinite(sequence.from) ||
			!Number.isFinite(sequence.sequencePlaybackRate) ||
			sequence.sequencePlaybackRate <= 0 ||
			!Number.isFinite(sequence.trimBefore ?? 0) ||
			(sequence.trimBefore ?? 0) < 0 ||
			((sequence.type === 'audio' || sequence.type === 'video') &&
				sequence.frozenMediaFrame !== null)
		) {
			return null;
		}

		if (!affected.has(sequence.id)) {
			continue;
		}

		const intrinsicDuration = sequence.intrinsicDuration ?? null;
		const sequenceParent =
			sequence.parent === null ? null : byId.get(sequence.parent)!;
		const parentClockEnd = sequenceParent
			? sequenceParent.duration * sequenceParent.sequencePlaybackRate +
				(sequenceParent.trimBefore ?? 0)
			: timelineDurationInFrames;
		const registeredParentClockEnd =
			sequence.controls?.videoConfigValues?.durationInFrames ?? parentClockEnd;
		// Custom clock providers and older registrations cannot be reconstructed.
		if (
			intrinsicDuration === null ||
			Number.isNaN(intrinsicDuration) ||
			intrinsicDuration <= 0 ||
			registeredParentClockEnd !== parentClockEnd ||
			Math.max(
				0,
				Math.min(intrinsicDuration, parentClockEnd - sequence.from),
			) !== sequence.duration
		) {
			return null;
		}
	}

	const originalTracks = calculateTimeline({sequences, overrideIdsToNodePaths});
	const originalOffsets = new Map(
		originalTracks.map((track) => [
			track.sequence.id,
			track.sequenceFrameOffset,
		]),
	);

	return {
		sequenceId: target.id,
		project: (nextDuration) => {
			if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
				return null;
			}

			if (nextDuration === initialDuration) {
				return sequences;
			}

			const delta = nextDuration - initialDuration;
			const projectedById = new Map<string, TSequence>();
			for (const sequence of ordered) {
				if (!affected.has(sequence.id)) {
					projectedById.set(sequence.id, sequence);
					continue;
				}

				const from = sequence.from + (shifted.has(sequence.id) ? delta : 0);
				if (!Number.isFinite(from)) {
					return null;
				}

				const intrinsicDuration =
					sequence.id === target.id
						? nextDuration
						: sequence.intrinsicDuration!;
				const sequenceParent =
					sequence.parent === null ? null : projectedById.get(sequence.parent)!;
				const parentClockEnd = sequenceParent
					? sequenceParent.duration * sequenceParent.sequencePlaybackRate +
						(sequenceParent.trimBefore ?? 0)
					: timelineDurationInFrames;
				const duration = Math.max(
					0,
					Math.min(intrinsicDuration, parentClockEnd - from),
				);
				projectedById.set(
					sequence.id,
					from === sequence.from &&
						duration === sequence.duration &&
						intrinsicDuration === sequence.intrinsicDuration
						? sequence
						: {
								...sequence,
								from,
								duration,
								intrinsicDuration,
								...(sequence.id === target.id
									? {unclippedDuration: nextDuration}
									: {}),
							},
				);
			}

			const projected = sequences.map(
				(sequence) => projectedById.get(sequence.id)!,
			);
			const tracks = calculateTimeline({
				sequences: projected,
				overrideIdsToNodePaths,
				showConnectedCompositionChildren: true,
			});
			const offsets = new Map(
				tracks.map((track) => [track.sequence.id, track.sequenceFrameOffset]),
			);
			return projected.map((sequence) => {
				if (
					!affected.has(sequence.id) ||
					(sequence.type !== 'audio' && sequence.type !== 'video')
				) {
					return sequence;
				}

				// Registrations bake ancestor clipping into media source clocks.
				// Rebase it when the preview moves a clip across a visible boundary.
				const parentOffsetDelta =
					sequence.parent === null
						? 0
						: originalOffsets.get(sequence.parent)! -
							offsets.get(sequence.parent)!;
				const ownOffsetDelta =
					offsets.get(sequence.id)! - originalOffsets.get(sequence.id)!;
				if (parentOffsetDelta === 0 && ownOffsetDelta === 0) {
					return sequence;
				}

				return {
					...sequence,
					mediaFrameAtSequenceZero:
						sequence.mediaFrameAtSequenceZero === null
							? null
							: sequence.mediaFrameAtSequenceZero + parentOffsetDelta,
					startMediaFrom:
						sequence.startMediaFrom + parentOffsetDelta + ownOffsetDelta,
				};
			});
		},
	};
};
