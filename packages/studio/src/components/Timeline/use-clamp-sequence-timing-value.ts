import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import {useCallback, useContext, useRef} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import {Internals} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {getKeyframeTrimConstraints} from './get-keyframe-trim-constraints';
import {getTimelineSequenceTimingLimits} from './get-timeline-sequence-timing-limits';

export const useClampSequenceTimingValue = () => {
	const calculateTimeline = useTimelineCalculator();
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const mappingsRef = useContext(OverrideIdToNodePathMappingsRefContext);
	const video = Internals.useVideo();
	const limitsRef = useRef(
		new Map<string, ReturnType<typeof getTimelineSequenceTimingLimits>>(),
	);
	const tracksBySourceRef = useRef<{
		tracks: readonly TimelineTrackData[];
		bySource: Map<string, TimelineTrackData[]>;
	} | null>(null);
	const clearTimingLimits = useCallback(() => {
		limitsRef.current.clear();
		tracksBySourceRef.current = null;
	}, []);
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
				const {tracks} = calculateTimeline({
					sequences,
					overrideIdsToNodePaths: mappingsRef.current,
				});
				const propStatuses =
					fieldKey === 'from'
						? propStatusesRef.current
						: getKeyframeTrimConstraints({
								propStatuses: propStatusesRef.current,
								overrideIdsToNodePaths: mappingsRef.current,
								sequences,
								affectedNodePaths: [nodePath],
							});
				if (tracksBySourceRef.current?.tracks !== tracks) {
					const bySource = new Map<string, TimelineTrackData[]>();
					for (const track of tracks) {
						if (!track.nodePathInfo) continue;
						const sourceKey = stringifySequenceSubscriptionKey(
							track.nodePathInfo.sequenceSubscriptionKey,
						);
						const matchingTracks = bySource.get(sourceKey) ?? [];
						matchingTracks.push(track);
						bySource.set(sourceKey, matchingTracks);
					}

					tracksBySourceRef.current = {tracks, bySource};
				}

				const matching = tracksBySourceRef.current.bySource.get(key) ?? [];
				for (const track of matching) {
					const next = getTimelineSequenceTimingLimits({
						propStatuses,
						movingSequenceIds: null,
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
		[
			calculateTimeline,
			mappingsRef,
			sequencesRef,
			propStatusesRef,
			video?.durationInFrames,
		],
	);
	return {clampTimingValue, clearTimingLimits};
};
