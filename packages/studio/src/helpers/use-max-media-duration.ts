import {getVideoMetadata} from '@remotion/media-utils';
import {ALL_FORMATS, Input, InputDisposedError, UrlSource} from 'mediabunny';
import {useEffect, useState} from 'react';
import {type TSequence} from 'remotion';

const cache = new Map<string, number>();

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

	const [maxMediaDuration, setMaxMediaDuration] = useState(
		src ? (cache.get(src) ?? null) : Infinity,
	);

	useEffect(() => {
		if (!src) {
			return;
		}

		const input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(src),
		});
		input
			.computeDuration()
			.then((duration) => {
				cache.set(src, Math.floor(duration * fps));
				setMaxMediaDuration(Math.floor(duration * fps));
			})
			.catch((e) => {
				if (e instanceof InputDisposedError) {
					return;
				}

				// In case of CORS errors, fall back to getVideoMetadata
				return getVideoMetadata(src)
					.then((metadata) => {
						const durationOrInfinity = metadata.durationInSeconds ?? Infinity;

						cache.set(src, Math.floor(durationOrInfinity * fps));
						setMaxMediaDuration(Math.floor(durationOrInfinity * fps));
					})
					.catch(() => {
						// Silently handle getVideoMetadata failures to prevent unhandled rejections
					});
			});

		return () => {
			input.dispose();
		};
	}, [src, fps]);

	return maxMediaDuration;
};
