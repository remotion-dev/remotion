import {VideoTrack} from '@remotion/media-parser';
import {ConvertMediaState, convertMedia} from '@remotion/webcodecs';
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
	const [state, setState] = useState<ConvertMediaState>({
		audioFrames: 0,
		videoFrames: 0,
		encodedVideoFrames: 0,
		encodedAudioFrames: 0,
		audioError: null,
		videoError: null,
	});

	const [downloadFn, setDownloadFn] = useState<null | (() => void)>(null);

	const ref = useRef<HTMLCanvasElement>(null);

	const i = useRef(0);

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
		},
		[],
	);

	const onClick = useCallback(async () => {
		try {
			const fn = await convertMedia({
				src,
				onVideoFrame,
				onMediaStateUpdate: (s) => {
					flushSync(() => {
						setState(() => s);
					});
				},
			});
			setDownloadFn(() => fn);
		} catch (err) {}
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
					<SampleCount
						errored={state.videoError !== null}
						count={state.videoFrames}
						label="VD"
					/>
					<SampleCount
						errored={state.videoError !== null}
						count={state.encodedVideoFrames}
						label="VE"
					/>
					<SampleCount
						errored={state.videoError !== null}
						count={state.audioFrames}
						label="AD"
					/>
					<SampleCount
						errored={state.videoError !== null}
						count={state.encodedAudioFrames}
						label="AE"
					/>
					<br />

					{downloadFn ? (
						<button type="button" onClick={downloadFn}>
							DL
						</button>
					) : null}
				</div>
			</AbsoluteFill>
		</div>
	);
};
