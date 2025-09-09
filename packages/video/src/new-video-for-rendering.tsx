import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	Internals,
	random,
	useCurrentFrame,
	useRemotionEnvironment,
} from 'remotion';
import {extractFrameViaBroadcastChannel} from './extract-frame-via-broadcast-channel';
import type {NewVideoProps} from './props';

const {
	useUnsafeVideoConfig,
	SequenceContext,
	useFrameForVolumeProp,
	useTimelinePosition,
	getAbsoluteSrc,
	RenderAssetManager,
	evaluateVolume,
} = Internals;

export const NewVideoForRendering: React.FC<NewVideoProps> = ({
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	toneFrequency,
	loopVolumeCurveBehavior,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	// call when a frame of the video, i.e. frame drawn on canvas
	onVideoFrame,
	audioStreamIndex,
	logLevel,
}) => {
	const absoluteFrame = useTimelinePosition();
	const videoConfig = useUnsafeVideoConfig();
	const sequenceContext = useContext(SequenceContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);
	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);
	const environment = useRemotionEnvironment();

	const id = useMemo(
		() =>
			`newvideo-${random(
				src ?? '',
			)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`,
		[
			src,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		],
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideo>.');
	}

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

	useEffect(() => {
		if (!src) {
			throw new Error('No src passed');
		}

		if (!window.remotion_audioEnabled) {
			return;
		}

		if (muted) {
			return;
		}

		if (volume <= 0) {
			return;
		}

		registerRenderAsset({
			type: 'video',
			src: getAbsoluteSrc(src),
			id,
			frame: absoluteFrame,
			volume,
			mediaFrame: frame,
			playbackRate: playbackRate ?? 1,
			toneFrequency: toneFrequency ?? null,
			audioStartFrame: Math.max(0, -(sequenceContext?.relativeFrom ?? 0)),
			audioStreamIndex: audioStreamIndex ?? 0,
		});

		return () => unregisterRenderAsset(id);
	}, [
		muted,
		src,
		registerRenderAsset,
		id,
		unregisterRenderAsset,
		volume,
		frame,
		absoluteFrame,
		playbackRate,
		toneFrequency,
		sequenceContext?.relativeFrom,
		audioStreamIndex,
	]);

	const {fps} = videoConfig;

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const actualFps = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFps;

		const newHandle = delayRender(`extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		extractFrameViaBroadcastChannel({
			src,
			timestamp,
			logLevel: logLevel ?? 'info',
			isClientSideRendering: environment.isClientSideRendering,
		})
			.then((imageBitmap) => {
				if (!imageBitmap) {
					cancelRender(new Error('No video frame found'));
				}

				onVideoFrame?.(imageBitmap);
				canvasRef.current?.getContext('2d')?.drawImage(imageBitmap, 0, 0);
				imageBitmap.close();

				continueRender(newHandle);
			})
			.catch((error) => {
				cancelRender(error);
			});

		return () => {
			continueRender(newHandle);
		};
	}, [
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		fps,
		frame,
		onVideoFrame,
		playbackRate,
		src,
		logLevel,
		environment.isClientSideRendering,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
		/>
	);
};
