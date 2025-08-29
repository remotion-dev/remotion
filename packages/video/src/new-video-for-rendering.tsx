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
} from 'remotion';
import {extractFrame} from './extract-frame';
import type {GetSink} from './get-frames-since-keyframe';
import {getVideoSink} from './get-frames-since-keyframe';
import {makeKeyframeManager} from './keyframe-manager';
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

const keyframeManager = makeKeyframeManager();

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

	const sinkPromise = useRef<Record<string, Promise<GetSink>>>({});

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		if (!sinkPromise.current[src]) {
			sinkPromise.current[src] = getVideoSink(src);
		}

		const actualFps = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFps;

		const newHandle = delayRender(`extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		extractFrame({
			src,
			timestamp,
			sinkPromise: sinkPromise.current[src],
			keyframeManager,
			logLevel: logLevel ?? 'info',
		})
			.then((videoSample) => {
				if (!videoSample) {
					cancelRender(new Error('No video frame found'));
				}

				const videoFrame = videoSample.toVideoFrame();

				onVideoFrame?.(videoFrame);
				canvasRef.current?.getContext('2d')?.drawImage(videoFrame, 0, 0);
				videoFrame.close();

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
	]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
		/>
	);
};
