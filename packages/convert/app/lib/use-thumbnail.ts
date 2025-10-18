import {
	ALL_FORMATS,
	AudioBufferSink,
	BlobSource,
	Input,
	UrlSource,
	VideoSampleSink,
} from 'mediabunny';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Source} from './convert-state';
import {makeWaveformVisualizer} from './waveform-visualizer';

export const useThumbnailAndWaveform = ({
	src,
	onVideoThumbnail,
	onDone,
	onWaveformBars,
}: {
	src: Source;
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
		const input = new Input({
			formats: ALL_FORMATS,
			source:
				src.type === 'file' ? new BlobSource(src.file) : new UrlSource(src.url),
		});

		const getDuration = async () => {
			const duration = await input.computeDuration();
			waveform.setDuration(duration);
		};

		const setAudioTrack = async () => {
			const audioTrack = await input.getPrimaryAudioTrack();

			if (audioTrack) {
				const audioSink = new AudioBufferSink(audioTrack);
				for await (const sample of audioSink.buffers()) {
					waveform.add(sample.buffer);
				}
			}
		};

		const setVideoTrack = async () => {
			const videoTrack = await input.getPrimaryVideoTrack();

			if (videoTrack) {
				const videoSink = new VideoSampleSink(videoTrack);
				let samples = 0;
				const iterator = videoSink.samples();
				for await (const sample of iterator) {
					samples++;
					onVideoThumbnail(sample.toVideoFrame());

					if (samples === 60) {
						iterator.return().catch(() => undefined);
						break;
					}
				}

				onDone();
			}
		};

		const run = async () => {
			await getDuration().then(() =>
				Promise.all([setAudioTrack(), setVideoTrack()]),
			);
			onDone();
		};

		run().catch((e) => {
			setError(e);
		});

		return () => {
			input.dispose();
		};
	}, [onDone, onVideoThumbnail, src, waveform]);

	useEffect(() => {
		execute();
	}, [execute]);

	return useMemo(() => {
		return {err};
	}, [err]);
};
