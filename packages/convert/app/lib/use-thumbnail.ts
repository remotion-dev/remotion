import {AudioOrVideoSample, LogLevel, parseMedia} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Source} from './convert-state';

export const useThumbnail = ({
	src,
	logLevel,
	onVideoThumbnail,
}: {
	src: Source;
	logLevel: LogLevel;
	onVideoThumbnail: (videoFrame: VideoFrame) => void;
}) => {
	const [err, setError] = useState<Error | null>(null);

	const execute = useCallback(() => {
		const abortController = new AbortController();
		parseMedia({
			signal: abortController.signal,
			reader: src.type === 'file' ? webFileReader : fetchReader,
			src: src.type === 'file' ? src.file : src.url,
			logLevel,
			onVideoTrack: async (track) => {
				if (typeof VideoDecoder === 'undefined') {
					return null;
				}

				let frames = 0;

				const decoder = new VideoDecoder({
					error: (error) => {
						// eslint-disable-next-line no-console
						console.log(error);
						setError(error);
						abortController.abort();
					},
					output(frame) {
						onVideoThumbnail(frame);
						frame.close();
					},
				});

				if (!(await VideoDecoder.isConfigSupported(track)).supported) {
					abortController.abort();
					setError(new Error('Video configuration not supported'));
					return null;
				}

				decoder.configure(track);

				return (sample) => {
					const remappedSample: AudioOrVideoSample = {
						...sample,
						duration: 1500,
					};
					frames++;
					if (frames >= 10) {
						abortController.abort();
					}

					decoder.decode(new EncodedVideoChunk(remappedSample));
				};
			},
		}).catch((err) => {
			if ((err as Error).stack?.includes('Cancelled')) {
				return;
			}
			if ((err as Error).stack?.toLowerCase()?.includes('aborted')) {
				return;
			}
			// firefox
			if ((err as Error).message?.toLowerCase()?.includes('aborted')) {
				return;
			}

			console.log(err);
			setError(err as Error);
		});

		return abortController;
	}, [logLevel, onVideoThumbnail, src]);

	useEffect(() => {
		const task = execute();

		return () => {
			task.abort();
		};
	}, [execute]);

	return useMemo(() => {
		return {err};
	}, [err]);
};
