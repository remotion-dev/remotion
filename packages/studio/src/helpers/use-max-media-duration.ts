import {useEffect, useState} from 'react';
import {type TSequence} from 'remotion';
import {getMediaDurationInFrames} from './get-media-duration-in-frames';
import {getMediaMetadata} from './use-media-metadata';

export {getMediaDurationInFrames} from './get-media-duration-in-frames';

const cache = new Map<string, number>();

const getCacheKey = (src: string, fps: number) => JSON.stringify([src, fps]);

const getSrc = (s: TSequence) => {
	if (s.type === 'video') {
		return s.src;
	}

	if (s.type === 'audio') {
		return s.src;
	}

	return null;
};

export const useMaxMediaDuration = (s: TSequence, fps: number) => {
	const src = getSrc(s);
	const cacheKey = src ? getCacheKey(src, fps) : null;

	const [maxMediaDuration, setMaxMediaDuration] = useState(
		cacheKey ? (cache.get(cacheKey) ?? null) : Infinity,
	);

	useEffect(() => {
		if (!src || !cacheKey) {
			return;
		}

		const cached = cache.get(cacheKey) ?? null;
		setMaxMediaDuration(cached);

		if (cached !== null) {
			return;
		}

		let cancelled = false;

		getMediaMetadata(src)
			.then((metadata) => {
				if (cancelled || !metadata) {
					return;
				}

				const duration = getMediaDurationInFrames({
					durationInSeconds: metadata.duration,
					fps,
				});
				cache.set(cacheKey, duration);
				setMaxMediaDuration(duration);
			})
			.catch(() => {
				if (cancelled) {
					return;
				}

				setMaxMediaDuration(null);
			});

		return () => {
			cancelled = true;
		};
	}, [cacheKey, fps, src]);

	if (maxMediaDuration !== null && (s.type === 'audio' || s.type === 'video')) {
		return maxMediaDuration;
	}

	return maxMediaDuration;
};
