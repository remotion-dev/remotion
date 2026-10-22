import {snapCanvasPositionToDevicePixel} from './device-pixel-alignment';
import {
	frameDatabase,
	getFrameDatabaseKeyPrefix,
	makeFrameDatabaseKey,
	mediaDurationCache,
} from './frame-database';

export const WEBCODECS_TIMESCALE = 1_000_000;
export const MAX_TIME_DEVIATION = WEBCODECS_TIMESCALE * 0.05;

// How far a frame is from the frame that is shown at a slot, 0 if it is shown.
// The duration makes this work for low and variable frame rate videos.
// Like extractFrames(), the last frame is shown after the end of the media.
export const getFrameDistance = ({
	src,
	frameTimestamp,
	frameDuration,
	slot,
}: {
	src: string;
	frameTimestamp: number;
	frameDuration: number | null;
	slot: number;
}) => {
	const mediaDuration = mediaDurationCache.get(src);
	const timestamp =
		mediaDuration === undefined
			? slot
			: Math.min(slot, mediaDuration * WEBCODECS_TIMESCALE - 1);
	if (
		frameTimestamp <= timestamp &&
		timestamp < frameTimestamp + (frameDuration ?? 0)
	) {
		return 0;
	}

	return Math.abs(frameTimestamp - timestamp);
};

const getFilledDistance = ({
	src,
	filled,
	slot,
}: {
	src: string;
	filled: number | undefined;
	slot: number;
}) => {
	if (filled === undefined) {
		return Infinity;
	}

	return getFrameDistance({
		src,
		frameTimestamp: filled,
		frameDuration:
			frameDatabase.get(makeFrameDatabaseKey(src, filled))?.frame.duration ??
			null,
		slot,
	});
};

// A frame that is closer to a slot than to the neighboring slots is a good
// enough thumbnail for it, so zooming out reuses the frames of a closer zoom.
export const getSlotTolerance = (slots: number[]) => {
	if (slots.length < 2) {
		return MAX_TIME_DEVIATION;
	}

	const [first, second] = [...slots].sort((a, b) => a - b);
	return Math.max(MAX_TIME_DEVIATION, (second - first) / 2);
};

// Slots that are filled with a frame that is too far away, for example after
// zooming in, or not filled at all.
export const getSlotsToExtract = ({
	filledSlots,
	src,
}: {
	filledSlots: Map<number, number | undefined>;
	src: string;
}) => {
	const slots = Array.from(filledSlots.keys());
	const tolerance = getSlotTolerance(slots);

	return slots.filter(
		(slot) =>
			getFilledDistance({src, filled: filledSlots.get(slot), slot}) > tolerance,
	);
};

export const getDurationOfOneFrame = ({
	visualizationWidth,
	aspectRatio,
	segmentDuration,
	frameHeight,
}: {
	visualizationWidth: number;
	aspectRatio: number;
	segmentDuration: number;
	frameHeight: number;
}) => {
	const framesFitInWidthUnrounded =
		visualizationWidth / (frameHeight * aspectRatio);
	return (segmentDuration / framesFitInWidthUnrounded) * WEBCODECS_TIMESCALE;
};

const fixRounding = (value: number) => {
	if (value % 1 >= 0.49999999) {
		return Math.ceil(value);
	}

	return Math.floor(value);
};

export const calculateTimestampSlots = ({
	visualizationWidth,
	fromSeconds,
	segmentDuration,
	aspectRatio,
	frameHeight,
}: {
	visualizationWidth: number;
	fromSeconds: number;
	segmentDuration: number;
	aspectRatio: number;
	frameHeight: number;
}) => {
	const framesFitInWidthUnrounded =
		visualizationWidth / (frameHeight * aspectRatio);
	const framesFitInWidth = Math.ceil(framesFitInWidthUnrounded);
	const durationOfOneFrame = getDurationOfOneFrame({
		visualizationWidth,
		aspectRatio,
		segmentDuration,
		frameHeight,
	});

	const timestampTargets: number[] = [];
	for (let i = 0; i < framesFitInWidth + 1; i++) {
		const target =
			fromSeconds * WEBCODECS_TIMESCALE + durationOfOneFrame * (i + 0.5);
		const snappedToDuration =
			(Math.round(fixRounding(target / durationOfOneFrame)) - 1) *
			durationOfOneFrame;

		timestampTargets.push(snappedToDuration);
	}

	return timestampTargets;
};

export const ensureSlots = ({
	filledSlots,
	naturalWidth,
	fromSeconds,
	toSeconds,
	aspectRatio,
	frameHeight,
}: {
	filledSlots: Map<number, number | undefined>;
	naturalWidth: number;
	fromSeconds: number;
	toSeconds: number;
	aspectRatio: number;
	frameHeight: number;
}) => {
	const segmentDuration = toSeconds - fromSeconds;

	const timestampTargets = calculateTimestampSlots({
		visualizationWidth: naturalWidth,
		fromSeconds,
		segmentDuration,
		aspectRatio,
		frameHeight,
	});

	for (const timestamp of timestampTargets) {
		if (!filledSlots.has(timestamp)) {
			filledSlots.set(timestamp, undefined);
		}
	}
};

export const drawSlot = ({
	frame,
	ctx,
	filledSlots,
	visualizationWidth,
	timestamp,
	segmentDuration,
	fromSeconds,
	devicePixelRatio,
	frameHeight,
	horizontalOffset,
}: {
	frame: VideoFrame;
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
	filledSlots: Map<number, number | undefined>;
	visualizationWidth: number;
	timestamp: number;
	segmentDuration: number;
	fromSeconds: number;
	devicePixelRatio: number;
	frameHeight: number;
	horizontalOffset: number;
}) => {
	const durationOfOneFrame = getDurationOfOneFrame({
		visualizationWidth,
		aspectRatio: frame.displayWidth / frame.displayHeight,
		segmentDuration,
		frameHeight,
	});

	const relativeTimestamp = timestamp - fromSeconds * WEBCODECS_TIMESCALE;
	const frameIndex = relativeTimestamp / durationOfOneFrame;
	const thumbnailWidth = frame.displayWidth / devicePixelRatio;
	const idealLeft = frameIndex * thumbnailWidth;
	const idealRight = idealLeft + thumbnailWidth;
	// When the canvas is aligned to the device-pixel grid, use the same absolute
	// grid for both edges so adjacent thumbnails neither shimmer nor leave seams.
	const left = snapCanvasPositionToDevicePixel({
		horizontalOffset,
		position: idealLeft,
	});
	const right = snapCanvasPositionToDevicePixel({
		horizontalOffset,
		position: idealRight,
	});

	ctx.drawImage(
		frame,
		left,
		0,
		right - left,
		frame.displayHeight / devicePixelRatio,
	);
	filledSlots.set(timestamp, frame.timestamp);
};

export const fillWithCachedFrames = ({
	ctx,
	naturalWidth,
	filledSlots,
	src,
	segmentDuration,
	fromSeconds,
	devicePixelRatio,
	frameHeight,
	horizontalOffset,
}: {
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
	naturalWidth: number;
	filledSlots: Map<number, number | undefined>;
	src: string;
	segmentDuration: number;
	fromSeconds: number;
	devicePixelRatio: number;
	frameHeight: number;
	horizontalOffset: number;
}) => {
	const prefix = getFrameDatabaseKeyPrefix(src);
	let candidates: NonNullable<ReturnType<typeof frameDatabase.get>>[] | null =
		null;
	const targets = Array.from(filledSlots.keys());

	for (const timestamp of targets) {
		const filledDistance = getFilledDistance({
			src,
			filled: filledSlots.get(timestamp),
			slot: timestamp,
		});
		// A frame covering this slot cannot be improved by another cached frame.
		if (filledDistance === 0) {
			continue;
		}

		if (candidates === null) {
			candidates = [];
			for (const [key, candidate] of frameDatabase) {
				if (key.startsWith(prefix)) {
					candidates.push(candidate);
				}
			}
		}

		let best: (typeof candidates)[number] | undefined;
		let bestDistance = Infinity;
		for (const candidate of candidates) {
			const distance = getFrameDistance({
				src,
				frameTimestamp: candidate.frame.timestamp,
				frameDuration: candidate.frame.duration,
				slot: timestamp,
			});
			if (distance < bestDistance) {
				bestDistance = distance;
				best = candidate;
				if (distance === 0) {
					break;
				}
			}
		}

		if (!best) {
			continue;
		}

		if (filledDistance <= bestDistance) {
			continue;
		}

		best.lastUsed = Date.now();

		drawSlot({
			ctx,
			frame: best.frame,
			filledSlots,
			visualizationWidth: naturalWidth,
			timestamp,
			segmentDuration,
			fromSeconds,
			devicePixelRatio,
			frameHeight,
			horizontalOffset,
		});
	}
};

export const fillFrameWhereItFits = ({
	frame,
	src,
	filledSlots,
	ctx,
	visualizationWidth,
	segmentDuration,
	fromSeconds,
	devicePixelRatio,
	frameHeight,
	horizontalOffset,
}: {
	frame: VideoFrame;
	src: string;
	filledSlots: Map<number, number | undefined>;
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
	visualizationWidth: number;
	segmentDuration: number;
	fromSeconds: number;
	devicePixelRatio: number;
	frameHeight: number;
	horizontalOffset: number;
}) => {
	const slots = Array.from(filledSlots.keys());

	for (const slot of slots) {
		const distance = getFrameDistance({
			src,
			frameTimestamp: frame.timestamp,
			frameDuration: frame.duration,
			slot,
		});
		if (distance > MAX_TIME_DEVIATION) {
			continue;
		}

		if (
			getFilledDistance({src, filled: filledSlots.get(slot), slot}) <= distance
		) {
			continue;
		}

		drawSlot({
			ctx,
			frame,
			filledSlots,
			visualizationWidth,
			timestamp: slot,
			segmentDuration,
			fromSeconds,
			devicePixelRatio,
			frameHeight,
			horizontalOffset,
		});
	}
};
