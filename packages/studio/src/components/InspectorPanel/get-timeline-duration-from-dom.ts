import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {scrollableRef} from '../Timeline/timeline-refs';
import {getTimelineRenderWindow} from '../Timeline/TimelineViewport';

// Called only when opening the duration menu. Read the geometry of rendered
// layer bodies, excluding premount/postmount stripes and available-content outlines.
export const getTimelineDurationFromDom = ({
	durationInFrames,
}: {
	readonly durationInFrames: number;
}): number | null => {
	const scrollable = scrollableRef.current;
	const tracks = scrollable?.querySelector<HTMLElement>(
		'[data-remotion-timeline-tracks]',
	);
	if (
		!scrollable ||
		!tracks ||
		tracks.dataset.remotionTimelineComplete !== 'true'
	) {
		return null;
	}

	// Virtualized rows or a cropped horizontal render window may hide a later end.
	const renderWindow = getTimelineRenderWindow(scrollable);
	const tracksWidth = parseFloat(getComputedStyle(tracks).width);
	const width = tracksWidth - TIMELINE_PADDING * 2;
	if (
		width <= 0 ||
		renderWindow.left !== 0 ||
		renderWindow.width < tracksWidth
	) {
		return null;
	}

	let end = 0;
	for (const layer of tracks.querySelectorAll<HTMLElement>(
		'[data-remotion-annotation-surface="layer"]',
	)) {
		const bodyWidth = Number(layer.dataset.remotionTimelineBodyWidth);
		if (!(bodyWidth > 0)) {
			continue;
		}

		end = Math.max(
			end,
			parseFloat(layer.style.marginLeft) +
				Number(layer.dataset.remotionTimelineBodyLeft) +
				bodyWidth,
		);
	}

	const frames = (end / width) * durationInFrames;
	// Ignore CSS serialization rounding without dropping a fractional last frame.
	const rounded = Math.round(frames);
	const duration =
		Math.abs(frames - rounded) < 0.001 ? rounded : Math.ceil(frames);
	// A bar at the composition boundary may be clipped or have unlimited duration.
	return Number.isFinite(duration) &&
		duration > 0 &&
		duration < durationInFrames
		? duration
		: null;
};
