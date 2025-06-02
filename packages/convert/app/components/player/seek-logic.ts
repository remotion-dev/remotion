import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {
	findGroupForInsertingTimestamp,
	type FrameDatabase,
} from './frame-database';

export const isSeekInfeasible = (
	frameDatabase: FrameDatabase,
	seekToSeconds: number,
) => {
	const group = findGroupForInsertingTimestamp({
		groups: frameDatabase._groups,
		timestamp: seekToSeconds * WEBCODECS_TIMESCALE,
	});

	// if there are no frames yet, they will arrive
	if (group.frames.length === 0) {
		return false;
	}

	// If every frame is already past the seek, we cannot do anything
	// 0.1sec tolerance because some videos first frame is a bit bigger than 0
	if (
		group.frames.every(
			(f) => f.frame.timestamp > (seekToSeconds + 0.1) * WEBCODECS_TIMESCALE,
		)
	) {
		return true;
	}

	return false;
};

export const isSeekAchieved = ({
	frameDatabase,
	seekToSeconds,
}: {
	frameDatabase: FrameDatabase;
	seekToSeconds: number;
}) => {
	const group = findGroupForInsertingTimestamp({
		groups: frameDatabase._groups,
		timestamp: seekToSeconds * WEBCODECS_TIMESCALE,
	});

	const hasFrameWithin01Seconds = group.frames.some(
		(f) =>
			Math.abs(f.frame.timestamp - seekToSeconds * WEBCODECS_TIMESCALE) <
			0.1 * WEBCODECS_TIMESCALE,
	);

	// If there are frames very close by, we consider the seek achieved.
	if (hasFrameWithin01Seconds) {
		return true;
	}

	// But there are also variable FPS videos, we can also
	// determine if there are frames before and after the seek
	// and consider the seek done.
	const hasFramesAfter = group.frames.some(
		(f) => f.frame.timestamp > seekToSeconds * WEBCODECS_TIMESCALE,
	);
	const hasFramesBefore = group.frames.some(
		(f) => f.frame.timestamp < seekToSeconds * WEBCODECS_TIMESCALE,
	);

	return hasFramesAfter && hasFramesBefore;
};
