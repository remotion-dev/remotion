import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import {useCallback, useContext, useRef} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {getTimelineSequenceTimingLimits} from './get-timeline-sequence-timing-limits';
import {loadKeyframeTrimConstraints} from './load-keyframe-trim-constraints';

export const useClampSequenceTimingValue = () => {
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const mappingsRef = useContext(OverrideIdToNodePathMappingsRefContext);
	const video = Internals.useVideo();
	const limitsRef = useRef(
		new Map<
			string,
			Promise<ReturnType<typeof getTimelineSequenceTimingLimits> | null>
		>(),
	);
	const clearTimingLimits = useCallback(() => {
		limitsRef.current.clear();
	}, []);
	const clampTimingValue = useCallback(
		async (
			nodePath: SequencePropsSubscriptionKey,
			fieldKey: string,
			value: unknown,
		) => {
			if (
				typeof value !== 'number' ||
				!['from', 'durationInFrames', 'trimBefore', 'trimAfter'].includes(
					fieldKey,
				)
			)
				return value;
			const key = stringifySequenceSubscriptionKey(nodePath);
			let pendingLimits = limitsRef.current.get(key);
			if (!pendingLimits) {
				const sequences = sequencesRef.current;
				const tracks = calculateTimeline({
					sequences,
					overrideIdsToNodePaths: mappingsRef.current,
				});
				const preparedProps =
					fieldKey === 'from'
						? Promise.resolve(propStatusesRef.current)
						: loadKeyframeTrimConstraints({
								propStatuses: propStatusesRef.current,
								overrideIdsToNodePaths: mappingsRef.current,
								sequences,
								affectedNodePaths: [nodePath],
							});
				const matching = tracks.filter(
					(track) =>
						track.nodePathInfo &&
						stringifySequenceSubscriptionKey(
							track.nodePathInfo.sequenceSubscriptionKey,
						) === key,
				);
				pendingLimits = preparedProps.then((propStatuses) => {
					let mergedLimits: ReturnType<
						typeof getTimelineSequenceTimingLimits
					> | null = null;
					for (const track of matching) {
						const next = getTimelineSequenceTimingLimits({
							propStatuses,
							movingSequenceIds: null,
							track,
							tracks,
							sequences,
							timelineDurationInFrames: video?.durationInFrames ?? Infinity,
						});
						mergedLimits = mergedLimits
							? {
									...next,
									minimumDuration: Math.max(
										mergedLimits.minimumDuration,
										next.minimumDuration,
									),
									maximumDuration: Math.min(
										mergedLimits.maximumDuration,
										next.maximumDuration,
									),
									minimumFrom: Math.max(
										mergedLimits.minimumFrom,
										next.minimumFrom,
									),
									maximumFrom: Math.min(
										mergedLimits.maximumFrom,
										next.maximumFrom,
									),
									minimumTrimBefore: Math.max(
										mergedLimits.minimumTrimBefore,
										next.minimumTrimBefore,
									),
									maximumTrimBefore: Math.min(
										mergedLimits.maximumTrimBefore,
										next.maximumTrimBefore,
									),
									minimumTrimAfter: Math.max(
										mergedLimits.minimumTrimAfter,
										next.minimumTrimAfter,
									),
									maximumTrimAfter: Math.min(
										mergedLimits.maximumTrimAfter,
										next.maximumTrimAfter,
									),
								}
							: next;
					}

					return mergedLimits;
				});
				limitsRef.current.set(key, pendingLimits);
			}

			const limits = await pendingLimits;
			if (!limits) return value;

			const [minimum, maximum] =
				fieldKey === 'from'
					? [limits.minimumFrom, limits.maximumFrom]
					: fieldKey === 'durationInFrames'
						? [
								limits.minimumDuration * limits.playbackRate,
								limits.maximumDuration * limits.playbackRate,
							]
						: fieldKey === 'trimBefore'
							? [limits.minimumTrimBefore, limits.maximumTrimBefore]
							: [limits.minimumTrimAfter, limits.maximumTrimAfter];
			return Math.max(
				minimum,
				Math.min(
					maximum,
					Number.isFinite(value)
						? value
						: Number.isFinite(maximum) && value === Infinity
							? maximum
							: minimum,
				),
			);
		},
		[mappingsRef, sequencesRef, propStatusesRef, video?.durationInFrames],
	);
	return {clampTimingValue, clearTimingLimits};
};
