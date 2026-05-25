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

		const input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(src),
		});

		Promise.all([
			getDurationOrCompute(input),
			input.getFormat(),
			input.getPrimaryVideoTrack(),
			input.getPrimaryAudioTrack(),
		])
			.then(async ([duration, format, videoTrack, audioTrack]) => {
				if (videoTrack && (await videoTrack.isLive())) {
					throw new Error(
						'Live streams are not currently supported by Remotion. Sorry! Source: ' +
							src,
					);
				}

				if (videoTrack && (await videoTrack.isRelativeToUnixEpoch())) {
					throw new Error(
						'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
							src,
					);
				}

				const [width, height, videoCodec, audioCodec] = await Promise.all([
					videoTrack ? videoTrack.getDisplayWidth() : null,
					videoTrack ? videoTrack.getDisplayHeight() : null,
					videoTrack ? videoTrack.getCodec() : null,
					audioTrack ? audioTrack.getCodec() : null,
				]);

				setMediaMetadata({
					duration,
					format: format.name,
					width,
					height,
					videoCodec,
					audioCodec,
				});
			})
			.catch(() => {
				// InputDisposedError (user navigated away) and
				// non-media files (e.g. .png, .json) — ignore silently
			});

		return () => {
			input.dispose();
		};
	}, [src]);

	return mediaMetadata;
};
