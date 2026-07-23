import type {CaptionJson} from '../caption-json';

export type CaptionTimingDragType = 'resize-start' | 'resize-end';

const clamp = (value: number, min: number, max: number) => {
	return Math.min(max, Math.max(min, value));
};

export const millisecondsToFrames = (milliseconds: number, fps: number) => {
	return (milliseconds / 1000) * fps;
};

export const framesToMilliseconds = (frames: number, fps: number) => {
	return (frames / fps) * 1000;
};

const updateTimestamp = ({
	caption,
	startMs,
	endMs,
}: {
	caption: CaptionJson;
	startMs: number;
	endMs: number;
}) => {
	if (caption.timestampMs === null) {
		return null;
	}

	const previousDuration = caption.endMs - caption.startMs;
	if (previousDuration <= 0) {
		return (startMs + endMs) / 2;
	}

	const position = (caption.timestampMs - caption.startMs) / previousDuration;
	return startMs + position * (endMs - startMs);
};

export const applyCaptionTimingDrag = ({
	caption,
	previousCaption,
	nextCaption,
	deltaFrames,
	durationInFrames,
	fps,
	type,
}: {
	caption: CaptionJson;
	previousCaption: CaptionJson | null;
	nextCaption: CaptionJson | null;
	deltaFrames: number;
	durationInFrames: number;
	fps: number;
	type: CaptionTimingDragType;
}): CaptionJson => {
	const frameDurationMs = framesToMilliseconds(1, fps);
	const compositionDurationMs = framesToMilliseconds(durationInFrames, fps);
	const frameDelta = Math.round(deltaFrames);
	let {startMs, endMs} = caption;

	if (type === 'resize-start') {
		const previousEndMs = previousCaption
			? clamp(previousCaption.endMs, 0, compositionDurationMs)
			: 0;
		const maximumStartMs = caption.endMs - frameDurationMs;
		const minimumStartMs = Math.min(previousEndMs, maximumStartMs);
		const targetStartFrame =
			Math.round(millisecondsToFrames(caption.startMs, fps)) + frameDelta;
		startMs = clamp(
			framesToMilliseconds(targetStartFrame, fps),
			minimumStartMs,
			maximumStartMs,
		);
	} else {
		const followingStartMs = nextCaption
			? clamp(nextCaption.startMs, 0, compositionDurationMs)
			: compositionDurationMs;
		const minimumEndMs = caption.startMs + frameDurationMs;
		const maximumEndMs = Math.max(minimumEndMs, followingStartMs);
		const targetEndFrame =
			Math.round(millisecondsToFrames(caption.endMs, fps)) + frameDelta;
		endMs = clamp(
			framesToMilliseconds(targetEndFrame, fps),
			minimumEndMs,
			maximumEndMs,
		);
	}

	return {
		...caption,
		startMs,
		endMs,
		timestampMs: updateTimestamp({caption, startMs, endMs}),
	};
};
