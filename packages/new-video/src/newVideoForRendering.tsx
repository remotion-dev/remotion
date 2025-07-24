import {extractFrames} from '@remotion/webcodecs';
import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {RemotionOffthreadVideoProps} from 'remotion';
import {
	continueRender,
	delayRender,
	Internals,
	random,
	useCurrentFrame,
} from 'remotion';
const {
	useUnsafeVideoConfig,
	SequenceContext,
	useFrameForVolumeProp,
	useTimelinePosition,
	getAbsoluteSrc,
	RenderAssetManager,
	evaluateVolume,
} = Internals;

export const NewVideoForRendering: React.FC<RemotionOffthreadVideoProps> = ({
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
	// Remove crossOrigin prop during rendering
	// https://discord.com/channels/809501355504959528/844143007183667220/1311639632496033813
	crossOrigin,
}) => {
	// eslint-disable-next-line    no-unused-expressions
	crossOrigin;
	const absoluteFrame = useTimelinePosition();
	const videoConfig = useUnsafeVideoConfig();
	const sequenceContext = useContext(SequenceContext);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);
	const [activeHandler, setActiveHandler] = useState<number | null>(null);
	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);

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
	]);
	const {fps} = videoConfig;
	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const newHandle = delayRender(`extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		extractFrames({
			src,
			// eslint-disable-next-line require-await
			timestampsInSeconds: async ({container}) => {
				const actualFPS = playbackRate ? fps / playbackRate : fps;
				let timestamp;
				if (container === 'mp4') {
					timestamp = Math.round(((frame + 1) / actualFPS) * 1000 + 1) / 1000;
				} else {
					timestamp = Math.round((frame / actualFPS) * 1000) / 1000;
				}

				return [timestamp];
			},
			onFrame: (extractedFrame) => {
				canvasRef.current?.getContext('2d')?.drawImage(extractedFrame, 0, 0);
				onVideoFrame?.(extractedFrame);
				extractedFrame.close();
				setActiveHandler(newHandle);
			},
		});
	}, [
		frame,
		playbackRate,
		onVideoFrame,
		src,
		fps,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
	]);

	useEffect(() => {
		if (activeHandler !== null) {
			requestAnimationFrame(() => {
				continueRender(activeHandler);
			});
		}
	}, [activeHandler]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
		/>
	);
};
