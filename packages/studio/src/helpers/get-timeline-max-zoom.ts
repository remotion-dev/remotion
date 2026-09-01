import {TIMELINE_PADDING} from './timeline-layout';

export const TIMELINE_MIN_ZOOM = 1;
export const TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM = 30;

const TIMELINE_ZOOM_SLIDER_MAX = 1000;

export const getTimelineMaxZoom = ({
	durationInFrames,
	timelineViewportWidth,
}: {
	readonly durationInFrames: number;
	readonly timelineViewportWidth: number;
}): number => {
	if (timelineViewportWidth <= 0) {
		return TIMELINE_MIN_ZOOM;
	}

	const timelineWidthAtMaxZoom =
		durationInFrames * TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM + TIMELINE_PADDING * 2;

	return Math.max(
		TIMELINE_MIN_ZOOM,
		timelineWidthAtMaxZoom / timelineViewportWidth,
	);
};

export const clampTimelineZoom = ({
	zoom,
	durationInFrames,
	timelineViewportWidth,
}: {
	readonly zoom: number;
	readonly durationInFrames: number;
	readonly timelineViewportWidth: number;
}): number => {
	const maxZoom = getTimelineMaxZoom({
		durationInFrames,
		timelineViewportWidth,
	});
	const clamped = Math.min(maxZoom, Math.max(TIMELINE_MIN_ZOOM, zoom));

	if (clamped === maxZoom) {
		return maxZoom;
	}

	return Math.min(maxZoom, Math.round(clamped * 10) / 10);
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
