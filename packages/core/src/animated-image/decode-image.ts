import type {RemotionAnimatedImageLoopBehavior} from './props';

export type AnimatedImageCacheItem = {
	timeInSeconds: number;
	frameIndex: number;
	frame: VideoFrame | null;
};

export type RemotionImageDecoder = {
	getFrame: (
		i: number,
		loopBehavior: RemotionAnimatedImageLoopBehavior,
	) => Promise<AnimatedImageCacheItem | null>;
	frameCount: number;
};

const CACHE_SIZE = 5;

const getActualTime = ({
	loopBehavior,
	durationFound,
	timeInSec,
}: {
	loopBehavior: RemotionAnimatedImageLoopBehavior;
	durationFound: number | null;
	timeInSec: number;
}) => {
	return loopBehavior === 'loop'
		? durationFound
			? timeInSec % durationFound
			: timeInSec
		: Math.min(timeInSec, durationFound || Infinity);
};

export const decodeImage = async ({
	resolvedSrc,
	signal,
	currentTime,
	initialLoopBehavior,
}: {
	resolvedSrc: string;
	signal: AbortSignal;
	currentTime: number;
	initialLoopBehavior: RemotionAnimatedImageLoopBehavior;
}): Promise<RemotionImageDecoder> => {
	if (typeof ImageDecoder === 'undefined') {
		throw new Error(
			'Your browser does not support the WebCodecs ImageDecoder API.',
		);
	}

	const res = await fetch(resolvedSrc, {signal});
	const {body} = res;

	if (!body) {
		throw new Error('Got no body');
	}

	const decoder = new ImageDecoder({
		data: body,
		type: res.headers.get('Content-Type') || 'image/gif',
	});
	await decoder.completed;
	const {selectedTrack} = decoder.tracks;
	if (!selectedTrack) {
		throw new Error('No selected track');
	}

	const cache: AnimatedImageCacheItem[] = [];

	let durationFound: number | null = null;

	const getFrameByIndex = async (
		frameIndex: number,
	): Promise<AnimatedImageCacheItem> => {
		const foundInCache = cache.find((c) => c.frameIndex === frameIndex);
		if (foundInCache && foundInCache.frame) {
			return foundInCache;
		}

		const frame = await decoder.decode({
			frameIndex,
			completeFramesOnly: true,
		});

		if (foundInCache) {
			foundInCache.frame = frame.image;
		} else {
			cache.push({
				frame: frame.image,
				frameIndex,
				timeInSeconds: frame.image.timestamp / 1_000_000,
			});
		}

		return {
			frame: frame.image,
			frameIndex,
			timeInSeconds: frame.image.timestamp / 1_000_000,
		};
	};

	const clearCache = (closeToTimeInSec: number) => {
		const itemsInCache = cache.filter((c) => c.frame);
		const sortByClosestToCurrentTime = itemsInCache.sort((a, b) => {
			const aDiff = Math.abs(a.timeInSeconds - closeToTimeInSec);
			const bDiff = Math.abs(b.timeInSeconds - closeToTimeInSec);
			return aDiff - bDiff;
		});
		for (let i = 0; i < sortByClosestToCurrentTime.length; i++) {
			if (i < CACHE_SIZE) {
				continue;
			}

			const item = sortByClosestToCurrentTime[i];
			item.frame = null;
		}
	};

	const ensureFrameBeforeAndAfter = async ({
		timeInSec,
		loopBehavior,
	}: {
		timeInSec: number;
		loopBehavior: RemotionAnimatedImageLoopBehavior;
	}) => {
		const actualTimeInSec = getActualTime({
			durationFound,
			loopBehavior,
			timeInSec,
		});
		const framesBefore = cache.filter(
			(c) => c.timeInSeconds <= actualTimeInSec,
		);
		const biggestIndex = framesBefore
			.map((c) => c.frameIndex)
			.reduce((a, b) => Math.max(a, b), 0);

		let i = biggestIndex;
		while (true) {
			const f = await getFrameByIndex(i);
			i++;
			if (!f.frame) {
				throw new Error('No frame found');
			}

			if (!f.frame.duration) {
				// non-animated, or AVIF in firefox
				break;
			}

			if (i === selectedTrack.frameCount && durationFound === null) {
				const duration = (f.frame.timestamp + f.frame.duration) / 1_000_000;
				durationFound = duration;
			}

			if (f.timeInSeconds > actualTimeInSec || i === selectedTrack.frameCount) {
				break;
			}
		}

		// If close to end, also cache first frame for smooth wrap around
		if (
			selectedTrack.frameCount - biggestIndex < 3 &&
			loopBehavior === 'loop'
		) {
			await getFrameByIndex(0);
		}

		clearCache(actualTimeInSec);
	};

	// Twice because might be over total duration
	await ensureFrameBeforeAndAfter({
		timeInSec: currentTime,
		loopBehavior: initialLoopBehavior,
	});
	await ensureFrameBeforeAndAfter({
		timeInSec: currentTime,
		loopBehavior: initialLoopBehavior,
	});

	const getFrame = async (
		timeInSec: number,
		loopBehavior: RemotionAnimatedImageLoopBehavior,
	) => {
		if (
			durationFound !== null &&
			timeInSec > durationFound &&
			loopBehavior === 'clear-after-finish'
		) {
			return null;
		}

		const actualTimeInSec = getActualTime({
			loopBehavior,
			durationFound,
			timeInSec,
		});
		await ensureFrameBeforeAndAfter({timeInSec: actualTimeInSec, loopBehavior});
		const itemsInCache = cache.filter((c) => c.frame);

		const closest = itemsInCache.reduce((a, b) => {
			const aDiff = Math.abs(a.timeInSeconds - actualTimeInSec);
			const bDiff = Math.abs(b.timeInSeconds - actualTimeInSec);
			return aDiff < bDiff ? a : b;
		});

		if (!closest.frame) {
			throw new Error('No frame found');
		}

		return closest;
	};

	return {
		getFrame,
		frameCount: selectedTrack.frameCount,
	};
};
