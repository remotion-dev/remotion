import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {useEffect, useState} from 'react';
import {getDurationOrCompute} from './get-duration-or-compute';

export type MediaMetadata = {
	duration: number;
	format: string;
	width: number | null;
	height: number | null;
	videoCodec: string | null;
	audioCodec: string | null;
};

export const useMediaMetadata = (src: string | null): MediaMetadata | null => {
	const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(
		null,
	);

	useEffect(() => {
		setMediaMetadata(null);

		if (!src) {
			return;
		}

		let cancelled = false;
		let input: Input | null = null;

		try {
			input = new Input({
				formats: ALL_FORMATS,
				source: new UrlSource(src),
			});
		} catch {
			return;
		}

		const safeCall = async <T>(fn: () => Promise<T>): Promise<T | null> => {
			try {
				return await fn();
			} catch {
				return null;
			}
		};

		(async () => {
			if (!input) {
				return;
			}

			const [duration, format, videoTrack, audioTrack] = await Promise.all([
				safeCall(() => getDurationOrCompute(input!)),
				safeCall(() => input!.getFormat()),
				safeCall(() => input!.getPrimaryVideoTrack()),
				safeCall(() => input!.getPrimaryAudioTrack()),
			]);

			if (cancelled || !format || duration === null) {
				return;
			}

			const [width, height, videoCodec, audioCodec] = await Promise.all([
				videoTrack ? safeCall(() => videoTrack.getDisplayWidth()) : null,
				videoTrack ? safeCall(() => videoTrack.getDisplayHeight()) : null,
				videoTrack ? safeCall(() => videoTrack.getCodec()) : null,
				audioTrack ? safeCall(() => audioTrack.getCodec()) : null,
			]);

			if (cancelled) {
				return;
			}

			setMediaMetadata({
				duration,
				format: format.name,
				width,
				height,
				videoCodec,
				audioCodec,
			});
		})().catch(() => {
			// Swallow any unexpected error — this is a non-essential UI enhancement.
		});

		return () => {
			cancelled = true;
			try {
				input?.dispose();
			} catch {
				// ignore
			}
		};
	}, [src]);

	return mediaMetadata;
};
