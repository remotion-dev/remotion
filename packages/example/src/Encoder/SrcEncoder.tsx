import {VideoTrack} from '@remotion/media-parser';
import {
	ConvertMediaProgress,
	convertMedia,
	webcodecsController,
} from '@remotion/webcodecs';
import React, {useCallback, useRef, useState} from 'react';
import {flushSync} from 'react-dom';
import {AbsoluteFill} from 'remotion';
import {fitElementSizeInContainer} from './fit-element-size-in-container';

const CANVAS_WIDTH = 1024 / 4;
const CANVAS_HEIGHT = (CANVAS_WIDTH / 16) * 9;

const SampleLabel: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			style={{
				height: 18,
				fontSize: 11,
				border: '1px solid white',
				display: 'inline-flex',
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 5,
				marginRight: 4,
				padding: 3,
				fontFamily: 'Arial',
				color: 'white',
			}}
		>
			{children}
		</div>
	);
};

const SampleCount: React.FC<{
	readonly count: number;
	readonly label: string;
}> = ({count, label}) => {
	return (
		<div style={{display: 'inline-block', color: 'white'}}>
			<SampleLabel>{label}</SampleLabel>
			{count}
		</div>
	);
};

export const SrcEncoder: React.FC<{
	readonly src: string;
	readonly label: string;
}> = ({src, label}) => {
	const [state, setState] = useState<ConvertMediaProgress>({
		decodedAudioFrames: 0,
		decodedVideoFrames: 0,
		encodedVideoFrames: 0,
		encodedAudioFrames: 0,
		bytesWritten: 0,
		millisecondsWritten: 0,
		expectedOutputDurationInMs: null,
		overallProgress: null,
	});

	const [downloadFn, setDownloadFn] = useState<null | (() => void)>(null);
	const [abortfn, setAbortFn] = useState<null | (() => void)>(null);
	const [error, setError] = useState<Error | null>(null);

	const ref = useRef<HTMLCanvasElement>(null);

	const i = useRef(0);

	const onVideoFrame = useCallback(
		async ({frame, track}: {frame: VideoFrame; track: VideoTrack}) => {
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

				const image = await createImageBitmap(frame, {
					resizeHeight: fitted.height * 2,
					resizeWidth: fitted.width * 2,
				});

				if (!ref.current) {
					return frame;
				}

				const context = ref.current.getContext('2d');
				if (!context) {
					return frame;
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

			return frame;
		},
		[],
	);

	const onClick = useCallback(async () => {
		try {
			const abortController = webcodecsController();
			setAbortFn(() => () => abortController.abort());
			const fn = await convertMedia({
				src,
				onVideoFrame,
				onProgress: (s) => {
					flushSync(() => {
						setState(() => s);
					});
				},
				videoCodec: 'vp9',
				audioCodec: 'opus',
				container: 'webm',
				controller: abortController,
			});
			setDownloadFn(() => {
				return async () => {
					const file = await fn.save();
					const a = document.createElement('a');
					a.href = URL.createObjectURL(file);
					a.download = 'hithere';
					a.click();

					setTimeout(() => {
						fn.remove();
					}, 1000);
				};
			});
		} catch (err) {
			console.log(err);
			setError(err as Error);
		}
	}, [onVideoFrame, src]);

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

				{error ? (
					<div style={{color: 'red'}}>{error.message}</div>
				) : downloadFn ? (
					<button type="button" onClick={downloadFn}>
						Download
					</button>
				) : abortfn ? (
					<button
						type="button"
						onClick={() => {
							abortfn();
						}}
					>
						Abort
					</button>
				) : (
					<button type="button" onClick={onClick}>
						Decode
					</button>
				)}
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
					<SampleCount count={state.decodedVideoFrames} label="VD" />
					<SampleCount count={state.encodedVideoFrames} label="VE" />
					<SampleCount count={state.decodedAudioFrames} label="AD" />
					<SampleCount count={state.encodedAudioFrames} label="AE" />
					<br />
				</div>
			</AbsoluteFill>
		</div>
	);
};
