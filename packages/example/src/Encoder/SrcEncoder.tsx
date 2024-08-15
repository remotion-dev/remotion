import {OnAudioTrack, OnVideoTrack, parseMedia} from '@remotion/media-parser';
import React, {useCallback, useRef} from 'react';
import {flushSync} from 'react-dom';
import {AbsoluteFill} from 'remotion';
import {fitElementSizeInContainer} from './fit-element-size-in-container';

const CANVAS_WIDTH = 1024 / 4;
const CANVAS_HEIGHT = (CANVAS_WIDTH / 16) * 9;

const SampleLabel: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			style={{
				height: 18,
				width: 18,
				fontSize: 11,
				border: '1px solid black',
				display: 'inline-flex',
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 5,
				marginRight: 4,
				fontFamily: 'Arial',
			}}
		>
			{children}
		</div>
	);
};

const SampleCount: React.FC<{
	count: number;
	label: string;
}> = ({count, label}) => {
	return (
		<div style={{display: 'inline-block'}}>
			<SampleLabel>{label}</SampleLabel>
			{count}
		</div>
	);
};

export const SrcEncoder: React.FC<{
	src: string;
	label: string;
}> = ({src, label}) => {
	const [samples, setSamples] = React.useState<number>(0);
	const [videoFrames, setVideoFrames] = React.useState<number>(0);
	const [audioFrames, setAudioFrames] = React.useState<number>(0);

	const ref = useRef<HTMLCanvasElement>(null);

	const i = useRef(0);

	const onVideoTrack: OnVideoTrack = useCallback(async (track) => {
		if (typeof VideoDecoder === 'undefined') {
			return null;
		}

		const decoder = await VideoDecoder.isConfigSupported(track);

		if (!decoder.supported) {
			return null;
		}

		const videoDecoder = new VideoDecoder({
			async output(inputFrame) {
				i.current++;
				if (i.current % 10 === 1) {
					const fitted = fitElementSizeInContainer({
						containerSize: {
							width: CANVAS_WIDTH,
							height: CANVAS_HEIGHT,
						},
						elementSize: {
							width: inputFrame.displayWidth,
							height: inputFrame.displayHeight,
						},
					});

					const image = await createImageBitmap(inputFrame, {
						resizeHeight: fitted.height,
						resizeWidth: fitted.width,
					});

					ref.current?.getContext('2d')?.drawImage(image, fitted.left, 0);
				}
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
		if (typeof AudioDecoder === 'undefined') {
			return null;
		}

		const {supported} = await AudioDecoder.isConfigSupported(track);

		if (!supported) {
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
		parseMedia({
			src,
			onVideoTrack,
			onAudioTrack,
		}).then(() => {});
	}, [onAudioTrack, onVideoTrack, src]);

	return (
		<div
			style={{
				height: 1024 / 4,
				width: 1024 / 4,
				padding: 10,
				display: 'inline-block',
				position: 'relative',
				marginBottom: 0,
			}}
		>
			<AbsoluteFill
				style={{
					background: 'white',
				}}
			>
				<canvas
					ref={ref}
					width={CANVAS_WIDTH}
					height={CANVAS_HEIGHT}
					style={{
						background: 'black',
					}}
				/>
				{label}{' '}
				<button type="button" onClick={onClick}>
					Decode
				</button>
				<div style={{display: 'flex', flexDirection: 'row', gap: 10}}>
					<SampleCount count={samples} label="S" />
					<SampleCount count={videoFrames} label="V" />
					<SampleCount count={audioFrames} label="A" />
				</div>
			</AbsoluteFill>
		</div>
	);
};
