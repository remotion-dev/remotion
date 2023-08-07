import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
import {
	getCurrentDuration,
	getCurrentFrame,
	getCurrentZoom,
	setCurrentDuration,
	setCurrentFps,
	setCurrentFrame,
	setCurrentZoom,
} from './imperative-state';
import {scrollableRef} from './timeline-refs';
import {
	ensureFrameIsInViewport,
	isCursorInViewport,
} from './timeline-scroll-logic';

// Keep track of the state when the last play happened
// so when "Enter" is pressed, we can restore the last timeline scroll position
type TimelinePosition = {
	scrollLeft: number;
	frame: number;
	zoomLevel: number;
	durationInFrames: number;
};

let lastTimelinePositionWhileScrolling: TimelinePosition | null = null;

export const TimelinePlayCursorSyncer: React.FC = () => {
	const video = Internals.useVideo();
	const timelineContext = useContext(Internals.Timeline.TimelineContext);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {zoom} = useContext(TimelineZoomCtx);

	setCurrentFrame(timelinePosition);
	setCurrentZoom(zoom);
	setCurrentDuration(video?.durationInFrames ?? 1);
	setCurrentFps(video?.fps ?? 1);

	const playing = timelineContext.playing ?? false;

	/**
	 * While playing (forwards or backwards), jump one viewport width to the left or right when the cursor goes out of the viewport.
	 */
	useEffect(() => {
		if (!video) {
			return;
		}

		if (!playing) {
			return;
		}

		ensureFrameIsInViewport({
			direction: timelineContext.playbackRate > 0 ? 'page-right' : 'page-left',
			durationInFrames: video.durationInFrames,
			frame: timelinePosition,
		});
	}, [playing, timelineContext, timelinePosition, video]);

	/**
	 * Restore state if `enter` is being pressed
	 */

	useEffect(() => {
		const {current} = scrollableRef;

		if (!current) {
			return;
		}

		if (playing) {
			lastTimelinePositionWhileScrolling = {
				scrollLeft: current.scrollLeft,
				frame: getCurrentFrame(),
				zoomLevel: getCurrentZoom(),
				durationInFrames: getCurrentDuration(),
			};
		} else if (lastTimelinePositionWhileScrolling !== null) {
			if (
				isCursorInViewport({
					frame: getCurrentFrame(),
					durationInFrames: getCurrentDuration(),
				})
			) {
				return;
			}

			if (
				lastTimelinePositionWhileScrolling.zoomLevel === getCurrentZoom() &&
				lastTimelinePositionWhileScrolling.durationInFrames ===
					getCurrentDuration()
			) {
				current.scrollLeft = lastTimelinePositionWhileScrolling.scrollLeft;
			} else {
				ensureFrameIsInViewport({
					direction: 'center',
					durationInFrames: getCurrentDuration(),
					frame: lastTimelinePositionWhileScrolling.frame,
				});
			}
		}
	}, [playing]);

	return null;
};
