export const TIMELINE_MIN_ZOOM = 1;
export const TIMELINE_MAX_ZOOM_FLOOR = 5;

/**
 * How many frames fill the timeline viewport at max zoom.
 * 30 frames matches the previous 5x cap on a 150-frame composition
 * (5 seconds at 30fps) and keeps a single frame wide enough to trim.
 */
export const TIMELINE_FRAMES_VISIBLE_AT_MAX_ZOOM = 30;

const TIMELINE_ZOOM_SLIDER_MAX = 1000;

export const getTimelineMaxZoom = (durationInFrames: number): number => {
	const frameLevelZoom = durationInFrames / TIMELINE_FRAMES_VISIBLE_AT_MAX_ZOOM;
	return Math.max(TIMELINE_MAX_ZOOM_FLOOR, Math.ceil(frameLevelZoom * 10) / 10);
};

export const clampTimelineZoom = ({
	zoom,
	durationInFrames,
}: {
	zoom: number;
	durationInFrames: number;
}): number => {
	const clamped = Math.min(
		getTimelineMaxZoom(durationInFrames),
		Math.max(TIMELINE_MIN_ZOOM, zoom),
	);
	return Math.round(clamped * 10) / 10;
};

export const timelineZoomToNormalized = ({
	zoom,
	maxZoom,
}: {
	zoom: number;
	maxZoom: number;
}): number => {
	if (maxZoom <= TIMELINE_MIN_ZOOM) {
		return 0;
	}

	const clampedZoom = Math.min(maxZoom, Math.max(TIMELINE_MIN_ZOOM, zoom));
	const normalized =
		Math.log(clampedZoom / TIMELINE_MIN_ZOOM) /
		Math.log(maxZoom / TIMELINE_MIN_ZOOM);
	return (
		Math.round(normalized * TIMELINE_ZOOM_SLIDER_MAX) / TIMELINE_ZOOM_SLIDER_MAX
	);
};

export const timelineZoomToSliderValue = ({
	zoom,
	maxZoom,
}: {
	zoom: number;
	maxZoom: number;
}): number => {
	return Math.round(
		timelineZoomToNormalized({zoom, maxZoom}) * TIMELINE_ZOOM_SLIDER_MAX,
	);
};

export const normalizedToTimelineZoom = ({
	normalized,
	maxZoom,
}: {
	normalized: number;
	maxZoom: number;
}): number => {
	if (maxZoom <= TIMELINE_MIN_ZOOM) {
		return TIMELINE_MIN_ZOOM;
	}

	const t = Math.min(1, Math.max(0, normalized));
	return TIMELINE_MIN_ZOOM * (maxZoom / TIMELINE_MIN_ZOOM) ** t;
};

export const sliderValueToTimelineZoom = ({
	sliderValue,
	maxZoom,
}: {
	sliderValue: number;
	maxZoom: number;
}): number => {
	return normalizedToTimelineZoom({
		normalized: sliderValue / TIMELINE_ZOOM_SLIDER_MAX,
		maxZoom,
	});
};

export const TIMELINE_ZOOM_SLIDER_PROPS = {
	min: 0,
	max: TIMELINE_ZOOM_SLIDER_MAX,
	step: 1,
} as const;
