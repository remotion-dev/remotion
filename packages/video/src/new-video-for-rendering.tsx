import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import {
	continueRender,
	delayRender,
	Internals,
	random,
	useCurrentFrame,
} from 'remotion';
import type {RequestFrameRequest, WorkerResponsePayload} from './payloads';
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

function createDedicatedWorker() {
	return new Worker(new URL('./worker.mjs', import.meta.url));
}

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
	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);
	const workerRef = useRef<Worker | null>(null);

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

		if (!workerRef.current) {
			const workerFetched = createDedicatedWorker();
			workerRef.current = workerFetched;
		}

		const {current: worker} = workerRef;

		const newHandle = delayRender(`extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		const actualFPS = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFPS;

		const paintHandler = (e: MessageEvent) => {
			const data = e.data as WorkerResponsePayload;
			if (data.type === 'request-frame-response') {
				canvasRef.current?.getContext('2d')?.drawImage(data.frame, 0, 0);
				onVideoFrame?.(data.frame);
				data.frame.close();

				continueRender(newHandle);
			}
		};

		worker.addEventListener('message', paintHandler);
		const request: RequestFrameRequest = {
			src: new URL(src, window.location.href).toString(),
			timestamp,
			type: 'request-frame-request',
		};
		worker.postMessage(request);

		return () => {
			worker.removeEventListener('message', paintHandler);
		};
	}, [
		frame,
		playbackRate,
		onVideoFrame,
		src,
		fps,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
		/>
	);
};
