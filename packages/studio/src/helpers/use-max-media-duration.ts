import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
} from '@remotion/media-parser';
import {getVideoMetadata} from '@remotion/media-utils';
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

		const controller = mediaParserController();

		parseMedia({
			src,
			controller,
			acknowledgeRemotionLicense: true,
			onDurationInSeconds: (duration) => {
				const durationOrInfinity = duration ?? Infinity;

				cache.set(src, Math.floor(durationOrInfinity * fps));
				setMaxMediaDuration(Math.floor(durationOrInfinity * fps));
			},
		}).catch((e) => {
			if (hasBeenAborted(e)) {
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
			try {
				controller.abort();
			} catch {}
		};
	}, [src, fps]);

	return maxMediaDuration;
};
