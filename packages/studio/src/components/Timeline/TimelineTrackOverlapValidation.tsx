import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	addErrorToOverlay,
	removeErrorFromOverlay,
} from '../../error-overlay/runtime-error-store';
import {FastRefreshContext} from '../../fast-refresh-context';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {getTimelineTrackOverlapError} from '../../helpers/get-timeline-track-overlap-error';
import {isVideoWithLastFrameHold} from '../../helpers/is-video-with-last-frame-hold';
import {
	type MediaMetadata,
	useMediaMetadata,
} from '../../helpers/use-media-metadata';

const TrackMediaMetadata: React.FC<{
	src: string;
	onMetadata: (src: string, metadata: MediaMetadata | null) => void;
}> = React.memo(({src, onMetadata}) => {
	// Shares cached and pending requests with the clip bars, including when
	// a collapsed or virtualized track has not mounted its bars.
	const metadata = useMediaMetadata(src);
	useEffect(() => {
		onMetadata(src, metadata);
	}, [metadata, onMetadata, src]);
	return null;
});

export const TimelineTrackOverlapValidation: React.FC<{
	timeline: readonly TimelineTrackData[];
	durationInFrames: number;
	fps: number;
}> = React.memo(({timeline, durationInFrames, fps}) => {
	const {fastRefreshes} = useContext(FastRefreshContext);
	const [mediaMetadata, setMediaMetadata] = useState<
		ReadonlyMap<string, MediaMetadata | null>
	>(() => new Map());
	const onMetadata = useCallback(
		(src: string, metadata: MediaMetadata | null) => {
			setMediaMetadata((previous) => {
				if (previous.get(src) === metadata) {
					return previous;
				}

				return new Map(previous).set(src, metadata);
			});
		},
		[],
	);
	const sources = useMemo(() => {
		const trackIds = new Set(
			timeline
				.filter(
					({sequence}) =>
						sequence.timelineTrack?.role === 'track' &&
						sequence.controls?.componentIdentity ===
							'dev.remotion.remotion.Track',
				)
				.map(({sequence}) => sequence.timelineTrack!.id),
		);
		return Array.from(
			new Set(
				timeline.flatMap(({sequence}) =>
					sequence.timelineTrack?.role === 'clip' &&
					trackIds.has(sequence.timelineTrack.id) &&
					(sequence.type === 'audio' || sequence.type === 'video') &&
					!sequence.loopDisplay &&
					!isVideoWithLastFrameHold(sequence)
						? [sequence.src]
						: [],
				),
			),
		);
	}, [timeline]);
	const error = useMemo(
		() =>
			getTimelineTrackOverlapError(
				timeline,
				durationInFrames,
				fps,
				mediaMetadata,
			),
		[timeline, durationInFrames, fps, mediaMetadata],
	);
	useEffect(() => {
		if (error === null) {
			return;
		}

		addErrorToOverlay(error, null);
		return () => removeErrorFromOverlay(error);
	}, [error, fastRefreshes]);

	return sources.map((src) => (
		<TrackMediaMetadata key={src} src={src} onMetadata={onMetadata} />
	));
});
