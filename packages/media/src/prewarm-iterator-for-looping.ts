import type {VideoSampleSink, VideoSampleTransformOptions} from 'mediabunny';
import type {CanvasAheadOfTimeIterator} from './canvas-ahead-of-time';
import {canvasesAheadOfTime} from './canvas-ahead-of-time';
import {FRAME_START_TOLERANCE} from './helpers/has-frame-started';

export const makePrewarmedVideoIteratorCache = (
	videoSink: VideoSampleSink,
	timeResolution: number,
	resize: VideoSampleTransformOptions | null = null,
) => {
	const prewarmedVideoIterators: Map<number, CanvasAheadOfTimeIterator> =
		new Map();

	// Snap to the track's own timestamp grid: WebM stores milliseconds, so frame 62
	// at 30fps (2.0667s) is stored at 2.067s and must not seek into the previous GOP.
	const snapToTrackTimeResolution = (timeToSeek: number) => {
		return (
			Math.floor((timeToSeek + FRAME_START_TOLERANCE) * timeResolution) /
			timeResolution
		);
	};

	const prewarmIteratorForLooping = ({timeToSeek}: {timeToSeek: number}) => {
		const snapped = snapToTrackTimeResolution(timeToSeek);
		if (!prewarmedVideoIterators.has(snapped)) {
			prewarmedVideoIterators.set(
				snapped,
				canvasesAheadOfTime(videoSink, snapped, resize),
			);
		}
	};

	const makeIteratorOrUsePrewarmed = (timeToSeek: number) => {
		const snapped = snapToTrackTimeResolution(timeToSeek);
		const prewarmedIterator = prewarmedVideoIterators.get(snapped);
		if (prewarmedIterator) {
			prewarmedVideoIterators.delete(snapped);
			return prewarmedIterator;
		}

		return canvasesAheadOfTime(videoSink, snapped, resize);
	};

	const destroy = () => {
		for (const iterator of prewarmedVideoIterators.values()) {
			// Closing an iterator whose decoder was reclaimed rejects.
			iterator.closeIterator().catch(() => undefined);
		}

		prewarmedVideoIterators.clear();
	};

	return {
		prewarmIteratorForLooping,
		makeIteratorOrUsePrewarmed,
		destroy,
	};
};

export type PrewarmedVideoIteratorCache = ReturnType<
	typeof makePrewarmedVideoIteratorCache
>;
