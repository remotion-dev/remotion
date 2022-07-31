import type React from 'react';
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
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
	const {zoom} = useContext(TimelineZoomCtx);
	const currentFrame = useRef<number>(timelineContext.frame);
	const currentZoom = useRef<number>(zoom);
	const currentDuration = useRef<number>(video?.durationInFrames ?? 1);

	currentFrame.current = timelineContext.frame;
	currentZoom.current = zoom;
	currentDuration.current = video?.durationInFrames ?? 1;

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

		ensureFrameIsInViewport(
			timelineContext.playbackRate > 0 ? 'page-right' : 'page-left',
			video.durationInFrames,
			timelineContext.frame
		);
	}, [playing, timelineContext, video]);

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
				frame: currentFrame.current,
				zoomLevel: currentZoom.current,
				durationInFrames: currentDuration.current,
			};
		} else if (lastTimelinePositionWhileScrolling !== null) {
			if (isCursorInViewport(currentFrame.current, currentDuration.current)) {
				return;
			}

			if (
				lastTimelinePositionWhileScrolling.zoomLevel === currentZoom.current &&
				lastTimelinePositionWhileScrolling.durationInFrames ===
					currentDuration.current
			) {
				current.scrollLeft = lastTimelinePositionWhileScrolling.scrollLeft;
			} else {
				ensureFrameIsInViewport(
					'center',
					currentDuration.current,
					lastTimelinePositionWhileScrolling.frame
				);
			}
		}
	}, [playing]);

	return null;
};
