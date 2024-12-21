import {LogLevel, parseMedia} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Source} from './convert-state';

export const useThumbnail = ({
	src,
	logLevel,
	onVideoThumbnail,
	onDone,
}: {
	src: Source;
	logLevel: LogLevel;
	onVideoThumbnail: (videoFrame: VideoFrame) => Promise<void>;
	onDone: () => void;
}) => {
	const [err, setError] = useState<Error | null>(null);

	const execute = useCallback(() => {
		const abortController = new AbortController();
		parseMedia({
			signal: abortController.signal,
			reader: src.type === 'file' ? webFileReader : fetchReader,
			src: src.type === 'file' ? src.file : src.url,
			logLevel,
			onVideoTrack: async ({track}) => {
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
						onVideoThumbnail(frame).then(() => {
							frame.close();
						});
					},
				});

				if (!(await VideoDecoder.isConfigSupported(track)).supported) {
					abortController.abort();
					setError(new Error('Video configuration not supported'));
					return null;
				}

				decoder.configure(track);

				return (sample) => {
					if (sample.type !== 'key') {
						return;
					}

					if (frames >= 3) {
						abortController.abort();
						return;
					}

					frames++;
					decoder.flush();
					decoder.decode(new EncodedVideoChunk(sample));
				};
			},
		})
			.catch((err) => {
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
			})
			.finally(() => {
				onDone();
			});

		return abortController;
	}, [logLevel, onDone, onVideoThumbnail, src]);

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
