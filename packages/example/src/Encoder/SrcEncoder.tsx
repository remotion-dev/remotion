import {OnAudioTrack, OnVideoTrack, parseMedia} from '@remotion/media-parser';
import React, {useCallback, useRef} from 'react';
import {flushSync} from 'react-dom';

export const SrcEncoder: React.FC<{
	src: string;
}> = ({src}) => {
	const [samples, setSamples] = React.useState<number>(0);
	const [videoFrames, setVideoFrames] = React.useState<number>(0);
	const [audioFrames, setAudioFrames] = React.useState<number>(0);

	const ref = useRef<HTMLCanvasElement>(null);

	const onVideoTrack: OnVideoTrack = useCallback(async (track) => {
		const decoder = await VideoDecoder.isConfigSupported(track);

		if (!decoder.supported) {
			return null;
		}

		const videoDecoder = new VideoDecoder({
			async output(inputFrame) {
				const image = await createImageBitmap(inputFrame, {
					resizeHeight: 100,
					resizeWidth: 100,
				});

				ref.current?.getContext('2d')?.drawImage(image, 0, 0);
				flushSync(() => {
					setVideoFrames((prev) => prev + 1);
				});
				inputFrame.close();
			},
			error(error) {
				console.error(error);
			},
		});
		videoDecoder.configure(track);

		return async (chunk) => {
			flushSync(() => {
				setSamples((s) => s + 1);
			});
			if (videoDecoder.decodeQueueSize > 10) {
				let resolve = () => {};

				const cb = () => {
					resolve();
				};

				await new Promise<void>((r) => {
					resolve = r;
					videoDecoder.addEventListener('dequeue', cb);
				});
				videoDecoder.removeEventListener('dequeue', cb);
			}
			videoDecoder.decode(new EncodedVideoChunk(chunk));
		};
	}, []);

	const onAudioTrack: OnAudioTrack = useCallback(async (track) => {
		console.log(track);

		const {supported} = await AudioDecoder.isConfigSupported(track);

		if (!supported) {
			return null;
		}

		if (typeof AudioDecoder === 'undefined') {
			return null;
		}

		const audioDecoder = new AudioDecoder({
			output(inputFrame) {
				flushSync(() => {
					setAudioFrames((prev) => prev + 1);
				});
				inputFrame.close();
			},
			error(error) {
				console.error(error);
			},
		});

		audioDecoder.configure(track);

		return async (audioSample) => {
			flushSync(() => {
				setSamples((s) => s + 1);
			});
			if (audioDecoder.decodeQueueSize > 10) {
				console.log('audio decoder queue size', audioDecoder.decodeQueueSize);
				let resolve = () => {};

				const cb = () => {
					resolve();
				};

				await new Promise<void>((r) => {
					resolve = r;
					// @ts-expect-error exists
					audioDecoder.addEventListener('dequeue', cb);
				});
				// @ts-expect-error exists
				audioDecoder.removeEventListener('dequeue', cb);
			}
			audioDecoder.decode(new EncodedAudioChunk(audioSample));
		};
	}, []);

	const onClick = useCallback(() => {
		console.time('done');
		parseMedia({
			src,
			onVideoTrack,
			onAudioTrack,
		}).then(() => {
			console.timeEnd('done');
		});
	}, [onAudioTrack, onVideoTrack, src]);

	return (
		<div>
			{src}{' '}
			<button type="button" onClick={onClick}>
				Decode
			</button>
			{samples > 0 && <div>{samples} samples</div>}
			{videoFrames > 0 && <div>{videoFrames} video frames</div>}
			{audioFrames > 0 && <div>{audioFrames} audio frames</div>}
			<canvas ref={ref} width={100} height={50} />
		</div>
	);
};
