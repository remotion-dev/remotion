import type {LogLevel} from '@remotion/media-parser';
import {parseMedia} from '@remotion/media-parser';
import {fetchReader} from '@remotion/media-parser/fetch';
import {webFileReader} from '@remotion/media-parser/web-file';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Source} from './convert-state';
import {makeWaveformVisualizer} from './waveform-visualizer';

export const useThumbnailAndWaveform = ({
	src,
	logLevel,
	onVideoThumbnail,
	onDone,
	onWaveformBars,
}: {
	src: Source;
	logLevel: LogLevel;
	onVideoThumbnail: (videoFrame: VideoFrame) => Promise<void>;
	onWaveformBars: (bars: number[]) => void;
	onDone: () => void;
}) => {
	const [err, setError] = useState<Error | null>(null);

	const waveform = useMemo(() => {
		return makeWaveformVisualizer({
			onWaveformBars,
		});
	}, [onWaveformBars]);

	const execute = useCallback(() => {
		const abortController = new AbortController();
		parseMedia({
			signal: abortController.signal,
			reader: src.type === 'file' ? webFileReader : fetchReader,
			src: src.type === 'file' ? src.file : src.url,
			logLevel,
			onDurationInSeconds: (dur) => {
				if (dur !== null) {
					waveform.setDuration(dur);
				}
			},
			onAudioTrack: async ({track}) => {
				if (typeof AudioDecoder === 'undefined') {
					return null;
				}

				const decoder = new AudioDecoder({
					output(frame) {
						waveform.add(frame);
						frame.close();
					},
					error: (error) => {
						// eslint-disable-next-line no-console
						console.log(error);
						setError(error);
						abortController.abort();
					},
				});

				if (!(await AudioDecoder.isConfigSupported(track)).supported) {
					abortController.abort();
					setError(new Error('Audio configuration not supported'));
					return null;
				}

				decoder.configure(track);

				return (sample) => {
					decoder.decode(new EncodedAudioChunk(sample));
				};
			},
			onVideoTrack: async ({track, container}) => {
				if (typeof VideoDecoder === 'undefined') {
					return null;
				}

				let frames = 0;
				const onlyKeyframes =
					container !== 'transport-stream' && container !== 'webm';
				const framesToGet = onlyKeyframes ? 3 : 30;

				const decoder = new VideoDecoder({
					error: (error) => {
						// eslint-disable-next-line no-console
						console.log(error);
						setError(error);
						abortController.abort();
					},
					output(frame) {
						if (frames >= framesToGet) {
							abortController.abort();
							frame.close();
							onDone();
							return;
						}

						frames++;

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
					if (sample.type !== 'key' && onlyKeyframes) {
						return;
					}

					if (sample.type === 'key') {
						decoder.flush();
					}

					decoder.decode(new EncodedVideoChunk(sample));
				};
			},
		}).catch((err2) => {
			if ((err2 as Error).stack?.includes('Cancelled')) {
				return;
			}

			if ((err2 as Error).stack?.toLowerCase()?.includes('aborted')) {
				return;
			}

			// firefox
			if ((err2 as Error).message?.toLowerCase()?.includes('aborted')) {
				return;
			}

			// eslint-disable-next-line no-console
			console.log(err2);
			setError(err2 as Error);
		});

		return abortController;
	}, [logLevel, onDone, onVideoThumbnail, src, waveform]);

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
