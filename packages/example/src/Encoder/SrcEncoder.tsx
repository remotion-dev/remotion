import {
	MediaFn,
	MediaParserInternals,
	OnAudioTrack,
	OnVideoTrack,
	VideoTrack,
	parseMedia,
} from '@remotion/media-parser';
import {webFsWriter} from '@remotion/media-parser/web-fs';
import {
	createAudioDecoder,
	createAudioEncoder,
	createVideoDecoder,
	createVideoEncoder,
} from '@remotion/webcodecs';
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

type State = {
	videoFrames: number;
	audioFrames: number;
	encodedVideoFrames: number;
	encodedAudioFrames: number;
	videoError: DOMException | null;
	audioError: DOMException | null;
};

export const SrcEncoder: React.FC<{
	src: string;
	label: string;
}> = ({src, label}) => {
	const [state, setRawState] = useState<State>({
		audioFrames: 0,
		videoFrames: 0,
		encodedVideoFrames: 0,
		encodedAudioFrames: 0,
		audioError: null,
		videoError: null,
	});
	const stateRef = useRef(state);

	const [downloadFn, setDownloadFn] = useState<null | (() => void)>(null);

	const setState: React.Dispatch<React.SetStateAction<State>> = useCallback(
		(newState) => {
			if (typeof newState === 'function') {
				stateRef.current = newState(stateRef.current);
				setRawState(stateRef.current);
				return;
			}
			stateRef.current = newState;
			setRawState(newState);
		},
		[],
	);

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
			flushSync(() => {
				setState((s) => ({...s, videoFrames: s.videoFrames + 1}));
			});
		},
		[setState],
	);

	const getFramesInEncodingQueue = useCallback(() => {
		return stateRef.current.videoFrames - stateRef.current.encodedVideoFrames;
	}, []);

	const onVideoTrack = useCallback(
		(mediaState: MediaFn): OnVideoTrack =>
			async (track) => {
				if (!mediaState) {
					throw new Error('mediaState is null');
				}

				const {trackNumber} = await mediaState.addTrack({
					type: 'video',
					color: {
						transferChracteristics: 'bt709',
						matrixCoefficients: 'bt709',
						primaries: 'bt709',
						fullRange: true,
					},
					width: track.codedWidth,
					height: track.codedHeight,
					// TODO: Unhardcode
					defaultDuration: 2658,
					codecId: 'V_VP8',
				});

				const videoEncoder = await createVideoEncoder({
					width: track.displayAspectWidth,
					height: track.displayAspectHeight,
					onChunk: async (chunk) => {
						await mediaState.addSample(chunk, trackNumber);
						const newDuration = Math.round(
							(chunk.timestamp + (chunk.duration ?? 0)) / 1000,
						);
						await mediaState.updateDuration(newDuration);
						flushSync(() => {
							setState((s) => ({
								...s,
								encodedVideoFrames: s.encodedVideoFrames + 1,
							}));
						});
					},
				});
				if (videoEncoder === null) {
					setState((s) => ({
						...s,
						videoError: new DOMException('Video encoder not supported'),
					}));
					return null;
				}

				const videoDecoder = await createVideoDecoder({
					track,
					onFrame: async (frame) => {
						await onVideoFrame(frame, track);
						await videoEncoder.encodeFrame(frame);
						frame.close();
					},
				});
				if (videoDecoder === null) {
					setState((s) => ({
						...s,
						videoError: new DOMException('Video decoder not supported'),
					}));
					return null;
				}

				mediaState.addWaitForFinishPromise(async () => {
					await videoDecoder.waitForFinish();
					await videoEncoder.waitForFinish();
					videoDecoder.close();
					videoEncoder.close();
				});

				return async (chunk) => {
					while (getFramesInEncodingQueue() > 50) {
						await new Promise<void>((r) => {
							setTimeout(r, 100);
						});
					}

					await videoDecoder.processSample(chunk);
				};
			},
		[getFramesInEncodingQueue, onVideoFrame, setState],
	);

	const onAudioTrack = useCallback(
		(mediaState: MediaFn): OnAudioTrack =>
			async (track) => {
				const {trackNumber} = await mediaState.addTrack({
					type: 'audio',
					codecId: 'A_OPUS',
					numberOfChannels: track.numberOfChannels,
					sampleRate: track.sampleRate,
				});

				const audioEncoder = await createAudioEncoder({
					onChunk: async (chunk) => {
						await mediaState.addSample(chunk, trackNumber);

						flushSync(() => {
							setState((s) => ({
								...s,
								encodedAudioFrames: s.encodedAudioFrames + 1,
							}));
						});
					},
					sampleRate: track.sampleRate,
					numberOfChannels: track.numberOfChannels,
				});

				if (!audioEncoder) {
					setState((s) => ({
						...s,
						audioError: new DOMException('Audio encoder not supported'),
					}));
					return null;
				}

				const audioDecoder = await createAudioDecoder({
					track,
					onFrame: async (frame) => {
						await audioEncoder.encodeFrame(frame);

						flushSync(() => {
							setState((s) => ({...s, audioFrames: s.audioFrames + 1}));
						});
						frame.close();
					},
					onError(error) {
						setState((s) => ({...s, audioError: error}));
					},
				});

				if (!audioDecoder) {
					setState((s) => ({
						...s,
						audioError: new DOMException('Audio decoder not supported'),
					}));
					return null;
				}

				mediaState.addWaitForFinishPromise(async () => {
					await audioDecoder.waitForFinish();
					await audioEncoder.waitForFinish();
					audioDecoder.close();
					audioEncoder.close();
				});

				return async (audioSample) => {
					await audioDecoder.processSample(audioSample);
				};
			},
		[setState],
	);

	const onClick = useCallback(() => {
		MediaParserInternals.createMedia(webFsWriter)
			.then((state) => {
				parseMedia({
					src,
					onVideoTrack: onVideoTrack(state),
					onAudioTrack: onAudioTrack(state),
				})
					.then(() => {
						return state.waitForFinish();
					})
					.then(() => {
						setDownloadFn(() => state.save);
					})
					.catch((err) => {
						console.error(err);
					});
			})
			.catch((err) => {
				console.error(err);
			});
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
