import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import {useCallback, useContext, useRef} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {getTimelineSequenceTimingLimits} from './get-timeline-sequence-timing-limits';

export const useClampSequenceTimingValue = () => {
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const mappingsRef = useContext(OverrideIdToNodePathMappingsRefContext);
	const video = Internals.useVideo();
	const limitsRef = useRef(
		new Map<string, ReturnType<typeof getTimelineSequenceTimingLimits>>(),
	);
	const clearTimingLimits = useCallback(() => limitsRef.current.clear(), []);
	const clampTimingValue = useCallback(
		(
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
			let limits = limitsRef.current.get(key);
			if (!limits) {
				const sequences = sequencesRef.current;
				const tracks = calculateTimeline({
					sequences,
					overrideIdsToNodePaths: mappingsRef.current,
				});
				const matching = tracks.filter(
					(track) =>
						track.nodePathInfo &&
						stringifySequenceSubscriptionKey(
							track.nodePathInfo.sequenceSubscriptionKey,
						) === key,
				);
				for (const track of matching) {
					const next = getTimelineSequenceTimingLimits({
						track,
						tracks,
						sequences,
						timelineDurationInFrames: video?.durationInFrames ?? Infinity,
					});
					limits = limits
						? {
								...next,
								minimumDuration: Math.max(
									limits.minimumDuration,
									next.minimumDuration,
								),
								maximumDuration: Math.min(
									limits.maximumDuration,
									next.maximumDuration,
								),
								minimumFrom: Math.max(limits.minimumFrom, next.minimumFrom),
								maximumFrom: Math.min(limits.maximumFrom, next.maximumFrom),
								minimumTrimBefore: Math.max(
									limits.minimumTrimBefore,
									next.minimumTrimBefore,
								),
								maximumTrimBefore: Math.min(
									limits.maximumTrimBefore,
									next.maximumTrimBefore,
								),
								minimumTrimAfter: Math.max(
									limits.minimumTrimAfter,
									next.minimumTrimAfter,
								),
								maximumTrimAfter: Math.min(
									limits.maximumTrimAfter,
									next.maximumTrimAfter,
								),
							}
						: next;
				}

				if (!limits) return value;
				limitsRef.current.set(key, limits);
			}

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
		[mappingsRef, sequencesRef, video?.durationInFrames],
	);
	return {clampTimingValue, clearTimingLimits};
};
