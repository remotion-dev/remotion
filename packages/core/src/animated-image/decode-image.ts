export type AnimatedImageCacheItem = {
	timeInSeconds: number;
	frameIndex: number;
	frame: VideoFrame | null;
};

export type RemotionImageDecoder = {
	getFrame: (i: number) => Promise<AnimatedImageCacheItem>;
	frameCount: number;
};

const CACHE_SIZE = 5;

export const decodeImage = async ({
	resolvedSrc,
	signal,
	currentTime,
}: {
	resolvedSrc: string;
	signal: AbortSignal;
	currentTime: number;
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

	const ensureFrameBeforeAndAfter = async (timeInSec: number) => {
		const actualTimeInSec = durationFound
			? timeInSec % durationFound
			: timeInSec;
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
				throw new Error('Frame has no duration');
			}

			if (i === selectedTrack.frameCount) {
				const duration = (f.frame.timestamp + f.frame.duration) / 1_000_000;
				durationFound = duration;
			}

			if (f.timeInSeconds > actualTimeInSec || i === selectedTrack.frameCount) {
				break;
			}
		}

		clearCache(actualTimeInSec);
	};

	// Twice because might be over total duration
	await ensureFrameBeforeAndAfter(currentTime);
	await ensureFrameBeforeAndAfter(currentTime);

	const getFrame = async (timeInSec: number) => {
		const actualTimeInSec = durationFound
			? timeInSec % durationFound
			: timeInSec;
		await ensureFrameBeforeAndAfter(actualTimeInSec);
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
