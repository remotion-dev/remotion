import {extractFrames} from '@remotion/webcodecs';
import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	continueRender,
	delayRender,
	Internals,
	random,
	useCurrentFrame,
} from 'remotion';
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
	const [worker, setWorker] = useState<SharedWorker | null>(null);

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

	function createInlineSharedWorker() {
		return new SharedWorker(new URL('./worker.mjs', import.meta.url));
	}

	useEffect(() => {
		if (!worker) {
			//only set on the initial run
			const workerFetched = createInlineSharedWorker();
			setWorker(workerFetched);
			let port = workerFetched.port;
			port.start();

			const frameExtractor = (e: MessageEvent) => {
						if (e.data.type == 'requesting-frame') {
					let {timestamp, src} = e.data;
					console.log(`processor recieved request for timestamp: ${timestamp}`);
					extractFrames({
						src,
						timestampsInSeconds: [timestamp],
						onFrame: (extractedFrame: VideoFrame) => {
							console.error('RCVD');
							port.postMessage(
								{
									type: 'frame-result',
									timestamp,
									frame: extractFrames,
								},
								[extractedFrame],
							);
						},
					});
				}
			};

			port.onmessage = frameExtractor
			port.postMessage({
				type: 'become-processor',
			});
		}
	}, []);

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		if (!worker) {
			return;
		}

		const newHandle = delayRender(`extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		let port = worker.port;

		const actualFPS = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFPS;

		const paintHandler = (e: MessageEvent) => {
			let msg = e.data;
			if (msg.type !== 'extracted-frame') {
				return;
			}
			let extractedFrame = msg.frame;
			canvasRef.current?.getContext('2d')?.drawImage(extractedFrame, 0, 0);
			onVideoFrame?.(extractedFrame);
			continueRender(newHandle);
		};

		port.addEventListener('message', paintHandler);
		port.postMessage({
			type: 'request-frame',
			src,
			timestamp,
		});

		return () => {
			port.removeEventListener('message', paintHandler);
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
