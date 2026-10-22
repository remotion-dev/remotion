import {subscribeToWaveformPeaks} from '@remotion/timeline-utils';
import type {Input} from 'mediabunny';
import {VideoSampleSink} from 'mediabunny';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AMOUNT_OF_BARS} from './waveform-visualizer';

export const useThumbnailAndWaveform = ({
	input,
	onVideoThumbnail,
	onDone,
	onWaveformBars,
}: {
	input: Input;
	onVideoThumbnail: (videoFrame: VideoFrame) => Promise<void>;
	onWaveformBars: (bars: number[]) => void;
	onDone: () => void;
}) => {
	const [err, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;
		let unsubscribe: (() => void) | null = null;
		onWaveformBars([]);
		input
			.getPrimaryAudioTrack()
			.then((track) => {
				if (cancelled || !track) {
					return;
				}

				unsubscribe = subscribeToWaveformPeaks({
					src: track,
					onPeaks: (peaks) => {
						const bars = new Array<number>(AMOUNT_OF_BARS).fill(0);
						for (let i = 0; i < peaks.length; i++) {
							const bar = Math.floor((i * AMOUNT_OF_BARS) / peaks.length);
							bars[bar] = Math.max(bars[bar], peaks[i]);
						}

						onWaveformBars(bars);
					},
					onError: () => onWaveformBars([]),
				});
			})
			.catch(() => {
				if (!cancelled) {
					onWaveformBars([]);
				}
			});
		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, [input, onWaveformBars]);

	const execute = useCallback(() => {
		const setVideoTrack = async () => {
			const videoTrack = await input.getPrimaryVideoTrack();

			if (videoTrack) {
				if (await videoTrack.isLive()) {
					throw new Error(
						'Live streams are not currently supported by Remotion. Sorry!',
					);
				}

				if (await videoTrack.isRelativeToUnixEpoch()) {
					throw new Error(
						'Streams with UNIX timestamps are not currently supported by Remotion. Sorry!',
					);
				}

				const videoSink = new VideoSampleSink(videoTrack);
				let samples = 0;
				const iterator = videoSink.samples();
				for await (const sample of iterator) {
					samples++;
					onVideoThumbnail(sample.toVideoFrame());
					sample.close();

					if (samples === 60) {
						iterator.return().catch(() => undefined);
						break;
					}
				}

				onDone();
			}
		};

		const run = async () => {
			await setVideoTrack();
			onDone();
		};

		run().catch((e) => {
			setError(e);
		});

		return () => {
			input.dispose();
		};
	}, [onDone, onVideoThumbnail, input]);

	useEffect(() => {
		execute();
	}, [execute]);

	return useMemo(() => {
		return {err};
	}, [err]);
};
