import {CanvasInternals} from '@remotion/sdk';
import type {
	CanUpdateSequencePropStatus,
	PropStatuses,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {getCachedMediaMetadata} from '../../helpers/use-media-metadata';
import {getTimelineSequenceNaturalDuration} from './get-timeline-sequence-natural-duration';
const {sortItemsByCommitOrder} = CanvasInternals;
const isTransitionSeriesTransition = (sequence: TSequence | undefined) =>
	sequence?.controls?.componentIdentity ===
	'dev.remotion.transitions.TransitionSeries.Transition';
export const getMinimumSequenceDuration = ({
	sequence,
	sequences,
}: {
	readonly sequence: TSequence;
	readonly sequences: TSequence[];
}) => {
	if (
		sequence.controls?.componentIdentity !==
		'dev.remotion.transitions.TransitionSeries.Sequence'
	) {
		return 1;
	}

	const siblings = sortItemsByCommitOrder(
		sequences.filter(
			(candidate) =>
				candidate.parent === sequence.parent &&
				(candidate.controls?.componentIdentity ===
					'dev.remotion.transitions.TransitionSeries.Sequence' ||
					isTransitionSeriesTransition(candidate)),
		),
		(candidate) => candidate.timelineOrder,
	);
	const sequenceIndex = siblings.findIndex(
		(candidate) => candidate.id === sequence.id,
	);
	if (sequenceIndex === -1) {
		return 1;
	}

	const previous = siblings[sequenceIndex - 1];
	const next = siblings[sequenceIndex + 1];

	return Math.max(
		1,
		isTransitionSeriesTransition(previous) ? previous.duration : 1,
		isTransitionSeriesTransition(next) ? next.duration : 1,
	);
};

const playbackRateComponentIdentities = new Set([
	'dev.remotion.gif.Gif',
	'dev.remotion.media.Audio',
	'dev.remotion.media.Video',
	'dev.remotion.remotion.AnimatedImage',
]);

export const getTrimPlaybackRate = ({
	sequence,
	runtimeValues,
}: {
	readonly sequence: TSequence;
	readonly runtimeValues: Readonly<Record<string, unknown>>;
}) => {
	const componentIdentity = sequence.controls?.componentIdentity;
	if (
		componentIdentity === null ||
		componentIdentity === undefined ||
		!playbackRateComponentIdentities.has(componentIdentity)
	) {
		return sequence.sequencePlaybackRate;
	}

	const runtimePlaybackRate = runtimeValues.playbackRate;
	return typeof runtimePlaybackRate === 'number' ? runtimePlaybackRate : 1;
};

export const getEffectiveSequenceTimingValues = ({
	sequence,
	propStatus,
}: {
	readonly sequence: TSequence;
	readonly propStatus: Record<string, CanUpdateSequencePropStatus> | null;
}) => {
	const {controls} = sequence;
	if (!controls) return {};
	// Saved Studio edits live in code overrides until JSX runtime values refresh.
	return Internals.computeEffectiveSchemaValuesDotNotation({
		schema: controls.schema,
		currentValue: controls.runtimeValues.getSnapshot(),
		overrideValues: {},
		propStatus: propStatus ?? undefined,
		frame: sequence.getCurrentFrame?.() ?? null,
	}).merged;
};

export const getTimelineSequenceTimingLimits = ({
	track,
	tracks,
	sequences,
	timelineDurationInFrames,
	movingSequenceIds,
	propStatuses,
}: {
	readonly track: TimelineTrackData;
	readonly tracks: readonly TimelineTrackData[];
	readonly sequences: TSequence[];
	readonly timelineDurationInFrames: number;
	readonly propStatuses: PropStatuses;
	readonly movingSequenceIds: ReadonlySet<string> | null;
}) => {
	const sequence = sequences.find((item) => item.id === track.sequence.id)!;
	const runtimeValues = getEffectiveSequenceTimingValues({
		sequence,
		propStatus: track.nodePathInfo
			? (Internals.getPropStatusesCtx(
					propStatuses,
					track.nodePathInfo.sequenceSubscriptionKey,
				) ?? null)
			: null,
	});
	const playbackRate = getTrimPlaybackRate({sequence, runtimeValues});
	const trimBefore =
		typeof runtimeValues.trimBefore === 'number'
			? runtimeValues.trimBefore
			: (sequence.trimBefore ?? 0);
	const minimumDuration = Math.max(
		(track.sequence.from + 1 - track.cascadedStart) *
			track.keyframePlaybackRate,
		getMinimumSequenceDuration({sequence, sequences}),
	);
	let initialDuration =
		typeof runtimeValues.durationInFrames === 'number' &&
		Number.isFinite(runtimeValues.durationInFrames)
			? runtimeValues.durationInFrames / playbackRate
			: sequence.autoDuration
				? (track.sequence.from +
						track.sequence.duration -
						track.cascadedStart) *
					track.keyframePlaybackRate
				: sequence.duration;
	const parentEnd = Math.min(
		timelineDurationInFrames,
		track.parentVisibleEnd ?? Infinity,
	);
	let maximumEnd = parentEnd;
	let minimumNeighbourStart = -Infinity;
	let maximumNeighbourEnd = Infinity;
	// Only normal Track clips exclude their neighbours. Series manages overlaps itself.
	if (
		sequence.timelineTrack?.role === 'clip' &&
		tracks.some(
			(item) =>
				item.sequence.timelineTrack?.id === sequence.timelineTrack?.id &&
				item.sequence.timelineTrack?.role === 'track' &&
				item.sequence.controls?.componentIdentity ===
					'dev.remotion.remotion.Track',
		)
	) {
		for (const item of tracks) {
			const sibling = item.sequence;
			if (
				sibling.id === sequence.id ||
				movingSequenceIds?.has(sibling.id) ||
				sibling.timelineTrack?.role !== 'clip' ||
				sibling.timelineTrack.id !== sequence.timelineTrack.id ||
				(!sibling.showInTimeline && sibling.type === 'sequence') ||
				sibling.duration <= 0
			) {
				continue;
			}

			if (sibling.from < track.sequence.from) {
				minimumNeighbourStart = Math.max(
					minimumNeighbourStart,
					sibling.from + sibling.duration,
				);
			} else {
				maximumNeighbourEnd = Math.min(maximumNeighbourEnd, sibling.from);
				maximumEnd = Math.min(maximumEnd, maximumNeighbourEnd);
			}
		}
	}

	const naturalDuration = getTimelineSequenceNaturalDuration({
		sequence,
		sequences,
	});
	let sourceEnd =
		naturalDuration === null
			? Infinity
			: trimBefore + naturalDuration * playbackRate;
	const isMedia = sequence.type === 'audio' || sequence.type === 'video';
	if (isMedia) {
		const metadata = getCachedMediaMetadata(sequence.src);
		const fps = sequence.controls?.videoConfigValues?.fps;
		// Until metadata is available, keep source edits within the known range.
		sourceEnd = metadata && fps ? Math.ceil(metadata.duration * fps) : Infinity;
	}

	const sourceMaximumTrimAfter = sourceEnd;
	if (typeof runtimeValues.trimAfter === 'number') {
		sourceEnd = Math.min(sourceEnd, runtimeValues.trimAfter);
	}

	const loops = Boolean(sequence.loopDisplay) || runtimeValues.loop === true;
	if (
		isMedia &&
		runtimeValues.durationInFrames === undefined &&
		!loops &&
		Number.isFinite(sourceEnd)
	) {
		initialDuration = Math.min(
			initialDuration,
			(sourceEnd - trimBefore) / playbackRate,
		);
	}

	const inferredDuration =
		sequence.autoDuration ||
		(isMedia && runtimeValues.durationInFrames === undefined);
	const spatialMaximumDuration =
		(maximumEnd - track.cascadedStart) * track.keyframePlaybackRate;
	const reservedDuration =
		inferredDuration || loops ? minimumDuration : initialDuration;
	const maximumDuration = Math.min(
		spatialMaximumDuration,
		loops
			? Infinity
			: isMedia
				? Math.max(initialDuration, (sourceEnd - trimBefore) / playbackRate)
				: (sourceEnd - trimBefore) / playbackRate,
	);
	// Preserve authored clipping: an already hidden edge may move farther outside
	// its parent, provided one frame remains visible. Neighbours still exclude it.
	const minimumMoveStart = Math.max(
		minimumNeighbourStart,
		track.cascadedStart < track.parentVisibleStart
			? track.parentVisibleStart -
					(initialDuration - 1) / track.keyframePlaybackRate
			: track.parentVisibleStart,
	);
	const maximumMoveEnd = Math.min(
		maximumNeighbourEnd,
		track.cascadedStart + initialDuration / track.keyframePlaybackRate >
			parentEnd
			? parentEnd + (initialDuration - 1) / track.keyframePlaybackRate
			: parentEnd,
	);
	return {
		playbackRate,
		minimumDuration,
		maximumDuration: Math.max(minimumDuration, maximumDuration),
		minimumFrom:
			sequence.from +
			(minimumMoveStart - track.cascadedStart) * track.keyframePlaybackRate,
		maximumFrom:
			sequence.from +
			(maximumMoveEnd - track.cascadedStart) * track.keyframePlaybackRate -
			initialDuration,
		minimumTrimBefore:
			isMedia && inferredDuration && !Number.isFinite(sourceEnd)
				? trimBefore
				: inferredDuration && !loops && Number.isFinite(sourceEnd)
					? Math.max(0, sourceEnd - spatialMaximumDuration * playbackRate)
					: 0,
		maximumTrimBefore:
			isMedia && !Number.isFinite(sourceEnd)
				? trimBefore
				: Math.max(0, sourceEnd - reservedDuration * playbackRate),
		maximumTrimAfter:
			inferredDuration && !loops
				? Math.min(
						sourceMaximumTrimAfter,
						trimBefore + spatialMaximumDuration * playbackRate,
					)
				: sourceMaximumTrimAfter,
		minimumTrimAfter: trimBefore + reservedDuration * playbackRate,
	};
};
