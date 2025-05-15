import type {MediaParserLogLevel} from '@remotion/media-parser';
import {mediaParserController} from '@remotion/media-parser';
import {parseMediaOnWebWorker} from '@remotion/media-parser/worker';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
	logLevel: MediaParserLogLevel;
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

	const hasStartedWaveform = useRef(false);

	const execute = useCallback(() => {
		const hasEnoughData = () => {
			onDone();
		};

		const controller = mediaParserController();

		let decoder: VideoDecoder | undefined;

		parseMediaOnWebWorker({
			controller,
			src: src.type === 'file' ? src.file : src.url,
			logLevel,
			acknowledgeRemotionLicense: true,
			onDurationInSeconds: (dur) => {
				if (dur !== null) {
					waveform.setDuration(dur);
				}
			},
			onAudioTrack: async ({track}) => {
				if (typeof AudioDecoder === 'undefined') {
					return null;
				}

				if (hasStartedWaveform.current) {
					return null;
				}

				hasStartedWaveform.current = true;

				const decoder = new AudioDecoder({
					output(frame) {
						waveform.add(frame);
						frame.close();
					},
					error: (error) => {
						// eslint-disable-next-line no-console
						console.log(error);
						setError(error);
						controller.abort();
					},
				});

				if (track.codecEnum === 'pcm-s16') {
					return (sample) => {
						waveform.add(
							new AudioData({
								data: sample.data,
								format: 's16',
								numberOfChannels: track.numberOfChannels,
								sampleRate: track.sampleRate,
								numberOfFrames:
									((sample.duration as number) * track.sampleRate) / 1_000_000,
								timestamp: sample.timestamp,
							}),
						);
					};
				}

				if (!(await AudioDecoder.isConfigSupported(track)).supported) {
					controller.abort();
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
					container !== 'transport-stream' &&
					container !== 'webm' &&
					container !== 'm3u8';
				const framesToGet = onlyKeyframes ? 3 : 30;

				decoder = new VideoDecoder({
					error: (error) => {
						// eslint-disable-next-line no-console
						console.log(error);
						setError(error);
						controller.abort();
					},
					output(frame) {
						if (frames >= framesToGet) {
							controller.abort();
							frame.close();
							hasEnoughData();
							return;
						}

						frames++;

						onVideoThumbnail(frame).then(() => {
							frame.close();
						});
					},
				});

				if (!(await VideoDecoder.isConfigSupported(track)).supported) {
					controller.abort();
					setError(new Error('Video configuration not supported'));
					return null;
				}

				decoder.configure(track);

				return (sample) => {
					if (sample.type !== 'key' && onlyKeyframes) {
						return;
					}

					if (sample.type === 'key') {
						decoder!.flush();
					}

					decoder!.decode(new EncodedVideoChunk(sample));
				};
			},
		})
			.catch((err2) => {
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
			})
			.then(() => {
				decoder?.flush();
				hasEnoughData();
			});

		return controller;
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
