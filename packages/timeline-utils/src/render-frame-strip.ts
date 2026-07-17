import type {FrameDatabaseKey} from './frame-database';
import {
	frameDatabase,
	getFrameDatabaseKeyPrefix,
	getTimestampFromFrameDatabaseKey,
} from './frame-database';

export const WEBCODECS_TIMESCALE = 1_000_000;
export const MAX_TIME_DEVIATION = WEBCODECS_TIMESCALE * 0.05;

export const getBestCachedFrameKeyForTimestamp = ({
	keys,
	timestamp,
	maxDeviation = MAX_TIME_DEVIATION,
}: {
	keys: readonly FrameDatabaseKey[];
	timestamp: number;
	maxDeviation?: number;
}): FrameDatabaseKey | null => {
	let bestKey: FrameDatabaseKey | undefined;
	let bestDistance = Infinity;

	for (const key of keys) {
		const distance = Math.abs(
			getTimestampFromFrameDatabaseKey(key) - timestamp,
		);
		if (distance < bestDistance) {
			bestDistance = distance;
			bestKey = key;
		}
	}

	if (!bestKey || bestDistance > maxDeviation) {
		return null;
	}

	return bestKey;
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
	const left = Math.floor(frameIndex * thumbnailWidth);
	const right = Math.ceil((frameIndex + 1) * thumbnailWidth);

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
}: {
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
	naturalWidth: number;
	filledSlots: Map<number, number | undefined>;
	src: string;
	segmentDuration: number;
	fromSeconds: number;
	devicePixelRatio: number;
	frameHeight: number;
}) => {
	const prefix = getFrameDatabaseKeyPrefix(src);
	const keys = Array.from(frameDatabase.keys()).filter((k) =>
		k.startsWith(prefix),
	);
	const targets = Array.from(filledSlots.keys());

	for (const timestamp of targets) {
		const bestKey = getBestCachedFrameKeyForTimestamp({
			keys,
			timestamp,
		});

		if (!bestKey) {
			continue;
		}

		const frame = frameDatabase.get(bestKey);
		if (!frame) {
			continue;
		}

		const alreadyFilled = filledSlots.get(timestamp);
		if (
			alreadyFilled &&
			Math.abs(alreadyFilled - timestamp) <=
				Math.abs(frame.frame.timestamp - timestamp)
		) {
			continue;
		}

		frame.lastUsed = Date.now();

		drawSlot({
			ctx,
			frame: frame.frame,
			filledSlots,
			visualizationWidth: naturalWidth,
			timestamp,
			segmentDuration,
			fromSeconds,
			devicePixelRatio,
			frameHeight,
		});
	}
};

export const fillFrameWhereItFits = ({
	frame,
	filledSlots,
	ctx,
	visualizationWidth,
	segmentDuration,
	fromSeconds,
	devicePixelRatio,
	frameHeight,
}: {
	frame: VideoFrame;
	filledSlots: Map<number, number | undefined>;
	ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
	visualizationWidth: number;
	segmentDuration: number;
	fromSeconds: number;
	devicePixelRatio: number;
	frameHeight: number;
}) => {
	const slots = Array.from(filledSlots.keys());

	for (let i = 0; i < slots.length; i++) {
		const slot = slots[i];
		if (Math.abs(slot - frame.timestamp) > MAX_TIME_DEVIATION) {
			continue;
		}

		const filled = filledSlots.get(slot);
		if (
			filled &&
			Math.abs(filled - slot) <= Math.abs(filled - frame.timestamp)
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
		});
	}
};
