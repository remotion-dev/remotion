import {
	MediaFn,
	MediaParserInternals,
	OnAudioTrack,
	OnVideoTrack,
	VideoTrack,
	parseMedia,
} from '@remotion/media-parser';
import {webFsWriter} from '@remotion/media-parser/web-fs';
import {createDecoder, createEncoder} from '@remotion/webcodecs';
import React, {useCallback, useRef, useState} from 'react';
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
				border: '1px solid white',
				display: 'inline-flex',
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 5,
				marginRight: 4,
				fontFamily: 'Arial',
				color: 'white',
			}}
		>
			{children}
		</div>
	);
};

const SampleCount: React.FC<{
	count: number;
	label: string;
	errored: boolean;
}> = ({count, label, errored}) => {
	return (
		<div style={{display: 'inline-block', color: errored ? 'red' : 'white'}}>
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
	const [videoError, setVideoError] = React.useState<DOMException | null>(null);
	const [audioError, setAudioError] = React.useState<DOMException | null>(null);

	const [mediaState, setMediaState] = useState<MediaFn | null>(() => null);

	const ref = useRef<HTMLCanvasElement>(null);

	const i = useRef(0);

	const onDownload = useCallback(async () => {
		if (mediaState) {
			await mediaState.save();
		}
	}, [mediaState]);

	const onVideoFrame = useCallback(
		async (inputFrame: VideoFrame, track: VideoTrack) => {
			i.current++;

			if (i.current % 10 === 1) {
				const rotatedWidth =
					track.rotation === -90 || track.rotation === 90
						? CANVAS_HEIGHT
						: CANVAS_WIDTH;
				const rotatedHeight =
					track.rotation === -90 || track.rotation === 90
						? CANVAS_WIDTH
						: CANVAS_HEIGHT;

				const fitted = fitElementSizeInContainer({
					containerSize: {
						width: rotatedWidth,
						height: rotatedHeight,
					},
					elementSize: {
						width: track.displayAspectWidth,
						height: track.displayAspectHeight,
					},
				});

				const image = await createImageBitmap(inputFrame, {
					resizeHeight: fitted.height * 2,
					resizeWidth: fitted.width * 2,
				});

				if (!ref.current) {
					return;
				}

				const context = ref.current.getContext('2d');
				if (!context) {
					return;
				}
				ref.current.width = CANVAS_WIDTH;
				ref.current.height = CANVAS_HEIGHT;

				if (track.rotation === -90) {
					context.rotate((-track.rotation * Math.PI) / 180);
					context.drawImage(
						image,
						fitted.left,
						-CANVAS_WIDTH / 2 - fitted.height / 2,
						fitted.width,
						fitted.height,
					);
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				// TODO: Implement 90 and 180 rotations
				else {
					context.drawImage(image, fitted.left, 0, fitted.width, fitted.height);
				}
			}
			flushSync(() => {
				setVideoFrames((prev) => prev + 1);
			});
		},
		[],
	);

	const onVideoTrack: OnVideoTrack = useCallback(
		async (track) => {
			const arr = await MediaParserInternals.createMedia(webFsWriter);
			setMediaState(arr);

			const videoEncoder = createEncoder({
				width: track.displayAspectWidth,
				height: track.displayAspectHeight,
				onChunk: async (chunk) => {
					await arr.addSample(chunk, track.trackId);
					const newDuration = Math.round(
						(chunk.timestamp + (chunk.duration ?? 0)) / 1000,
					);
					await arr.updateDuration(newDuration);
				},
			});
			if (videoEncoder === null) {
				setVideoError(new DOMException('Video encoder not supported'));
				return null;
			}

			const videoDecoder = await createDecoder({
				track,
				onFrame: async (frame) => {
					await onVideoFrame(frame, track);
					await videoEncoder.encodeFrame(frame);
					frame.close();
				},
			});
			if (videoDecoder === null) {
				setVideoError(new DOMException('Video decoder not supported'));
				return null;
			}

			return async (chunk) => {
				flushSync(() => {
					setSamples((s) => s + 1);
				});
				videoDecoder.processSample(chunk);
			};
		},
		[onVideoFrame],
	);

	const onAudioTrack: OnAudioTrack = useCallback(async (track) => {
		if (typeof AudioDecoder === 'undefined') {
			return null;
		}

		const {supported, config} = await AudioDecoder.isConfigSupported(track);

		if (!supported) {
			setAudioError(new DOMException('Audio decoder not supported'));
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
				setAudioError(error);
			},
		});

		audioDecoder.configure(config);

		return async (audioSample) => {
			flushSync(() => {
				setSamples((s) => s + 1);
			});

			if (audioDecoder.state === 'closed') {
				return;
			}

			if (audioDecoder.decodeQueueSize > 10) {
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
				height: 200,
				width: 1024 / 4,
				padding: 10,
				display: 'inline-block',
				position: 'relative',
				marginBottom: -4,
			}}
		>
			<AbsoluteFill
				style={{
					background: 'black',
					textAlign: 'center',
					fontFamily: 'Arial',
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
				<div
					style={{
						color: 'white',
						height: 20,
						position: 'absolute',
						textAlign: 'left',
						width: 1024 / 4,
						wordBreak: 'break-word',
						fontSize: 14,
						padding: 5,
					}}
				>
					{label}{' '}
				</div>
				<button type="button" onClick={onClick}>
					Decode
				</button>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						gap: 10,
						justifyContent: 'center',
						alignItems: 'center',
						height: 38,
					}}
				>
					<SampleCount errored={false} count={samples} label="S" />
					<SampleCount
						errored={videoError !== null}
						count={videoFrames}
						label="V"
					/>
					<SampleCount
						errored={audioError !== null}
						count={audioFrames}
						label="A"
					/>
					{mediaState ? (
						<button type="button" onClick={onDownload}>
							DL
						</button>
					) : null}
				</div>
			</AbsoluteFill>
		</div>
	);
};
