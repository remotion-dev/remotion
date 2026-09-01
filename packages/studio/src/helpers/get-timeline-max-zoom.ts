import {TIMELINE_PADDING} from './timeline-layout';

const TIMELINE_ZOOM_FALLBACK = 1;
export const TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM = 30;

const TIMELINE_ZOOM_SLIDER_MAX = 1000;

export const getTimelineMinZoom = ({
	durationInFrames,
	timelineViewportWidth,
}: {
	readonly durationInFrames: number;
	readonly timelineViewportWidth: number;
}): number => {
	if (durationInFrames <= 0 || timelineViewportWidth <= 0) {
		return TIMELINE_ZOOM_FALLBACK;
	}

	return Math.min(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
		Math.max(1, timelineViewportWidth - TIMELINE_PADDING * 2) /
			durationInFrames,
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
	const minZoom = getTimelineMinZoom({
		durationInFrames,
		timelineViewportWidth,
	});
	const clamped = Math.min(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
		Math.max(minZoom, zoom),
	);

	if (clamped === minZoom || clamped === TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM) {
		return clamped;
	}

	return Math.min(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
		Math.max(minZoom, Math.round(clamped * 1000) / 1000),
	);
};

export const getTimelineZoom = ({
	durationInFrames,
	timelineViewportWidth,
	zoom,
}: {
	readonly durationInFrames: number;
	readonly timelineViewportWidth: number;
	readonly zoom: number | null;
}): number => {
	return clampTimelineZoom({
		durationInFrames,
		timelineViewportWidth,
		zoom: zoom ?? getTimelineMinZoom({durationInFrames, timelineViewportWidth}),
	});
};

export const getTimelineWidth = ({
	durationInFrames,
	zoom,
}: {
	readonly durationInFrames: number;
	readonly zoom: number;
}): number => {
	return durationInFrames * zoom + TIMELINE_PADDING * 2;
};

export const timelineZoomToNormalized = ({
	zoom,
	minZoom,
}: {
	readonly zoom: number;
	readonly minZoom: number;
}): number => {
	if (minZoom >= TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM) {
		return 0;
	}

	const clampedZoom = Math.min(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
		Math.max(minZoom, zoom),
	);
	const normalized =
		Math.log(clampedZoom / minZoom) /
		Math.log(TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM / minZoom);
	return (
		Math.round(normalized * TIMELINE_ZOOM_SLIDER_MAX) / TIMELINE_ZOOM_SLIDER_MAX
	);
};

export const timelineZoomToSliderValue = ({
	zoom,
	minZoom,
}: {
	readonly zoom: number;
	readonly minZoom: number;
}): number => {
	return Math.round(
		timelineZoomToNormalized({zoom, minZoom}) * TIMELINE_ZOOM_SLIDER_MAX,
	);
};

export const normalizedToTimelineZoom = ({
	normalized,
	minZoom,
}: {
	readonly normalized: number;
	readonly minZoom: number;
}): number => {
	if (minZoom >= TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM) {
		return TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM;
	}

	const t = Math.min(1, Math.max(0, normalized));
	return minZoom * (TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM / minZoom) ** t;
};

export const sliderValueToTimelineZoom = ({
	sliderValue,
	minZoom,
}: {
	readonly sliderValue: number;
	readonly minZoom: number;
}): number => {
	return normalizedToTimelineZoom({
		normalized: sliderValue / TIMELINE_ZOOM_SLIDER_MAX,
		minZoom,
	});
};

export const TIMELINE_ZOOM_SLIDER_PROPS = {
	min: 0,
	max: TIMELINE_ZOOM_SLIDER_MAX,
	step: 1,
} as const;
