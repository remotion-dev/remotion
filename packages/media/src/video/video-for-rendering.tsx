import React, {
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	cancelRender,
	Internals,
	OffthreadVideo,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {frameForVolumeProp} from '../looped-frame';
import {extractFrameViaBroadcastChannel} from '../video-extraction/extract-frame-via-broadcast-channel';
import type {VideoProps} from './props';

export const VideoForRendering: React.FC<VideoProps> = ({
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	loopVolumeCurveBehavior,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	onVideoFrame,
	logLevel = window.remotion_logLevel,
	loop,
	style,
	className,
	fallbackOffthreadVideoProps,
	name,
	showInTimeline,
}) => {
	if (!src) {
		throw new TypeError('No `src` was passed to <Video>.');
	}

	const frame = useCurrentFrame();
	const absoluteFrame = Internals.useTimelinePosition();

	const {fps} = useVideoConfig();
	const {registerRenderAsset, unregisterRenderAsset} = useContext(
		Internals.RenderAssetManager,
	);
	const startsAt = Internals.useMediaStartsAt();

	const [id] = useState(() => `${Math.random()}`.replace('0.', ''));

	const environment = useRemotionEnvironment();
	const {delayRender, continueRender} = useDelayRender();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [replaceWithOffthreadVideo, setReplaceWithOffthreadVideo] =
		useState(false);

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		if (replaceWithOffthreadVideo) {
			return;
		}

		const actualFps = playbackRate ? fps / playbackRate : fps;
		const timestamp = frame / actualFps;
		const durationInSeconds = 1 / actualFps;

		const newHandle = delayRender(`Extracting frame number ${frame}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		const shouldRenderAudio = (() => {
			if (!window.remotion_audioEnabled) {
				return false;
			}

			if (muted) {
				return false;
			}

			return true;
		})();

		extractFrameViaBroadcastChannel({
			src,
			timeInSeconds: timestamp,
			durationInSeconds,
			playbackRate: playbackRate ?? 1,
			logLevel: logLevel ?? 'info',
			includeAudio: shouldRenderAudio,
			includeVideo: window.remotion_videoEnabled,
			isClientSideRendering: environment.isClientSideRendering,
			loop: loop ?? false,
		})
			.then((result) => {
				if (result === 'cannot-decode') {
					Internals.Log.info(
						{logLevel, tag: '@remotion/media'},
						`Cannot decode ${src}, falling back to <OffthreadVideo>`,
					);
					setReplaceWithOffthreadVideo(true);
					return;
				}

				const {
					frame: imageBitmap,
					audio,
					durationInSeconds: assetDurationInSeconds,
				} = result;
				if (imageBitmap) {
					onVideoFrame?.(imageBitmap);
					const context = canvasRef.current?.getContext('2d');
					if (!context) {
						return;
					}

					context.canvas.width =
						imageBitmap instanceof ImageBitmap
							? imageBitmap.width
							: imageBitmap.displayWidth;
					context.canvas.height =
						imageBitmap instanceof ImageBitmap
							? imageBitmap.height
							: imageBitmap.displayHeight;
					context.canvas.style.aspectRatio = `${context.canvas.width} / ${context.canvas.height}`;
					context.drawImage(imageBitmap, 0, 0);

					imageBitmap.close();
				} else if (window.remotion_videoEnabled) {
					cancelRender(new Error('No video frame found'));
				}

				const volumePropsFrame = frameForVolumeProp({
					behavior: loopVolumeCurveBehavior ?? 'repeat',
					loop: loop ?? false,
					assetDurationInSeconds: assetDurationInSeconds ?? 0,
					fps,
					frame,
					startsAt,
				});

				const volume = Internals.evaluateVolume({
					volume: volumeProp,
					frame: volumePropsFrame,
					mediaVolume: 1,
				});

				Internals.warnAboutTooHighVolume(volume);

				if (audio && volume > 0) {
					applyVolume(audio.data, volume);
					registerRenderAsset({
						type: 'inline-audio',
						id,
						audio: Array.from(audio.data),
						sampleRate: audio.sampleRate,
						numberOfChannels: audio.numberOfChannels,
						frame: absoluteFrame,
						timestamp: audio.timestamp,
						duration: (audio.numberOfFrames / audio.sampleRate) * 1_000_000,
					});
				}

				continueRender(newHandle);
			})
			.catch((error) => {
				cancelRender(error);
			});

		return () => {
			continueRender(newHandle);
			unregisterRenderAsset(id);
		};
	}, [
		absoluteFrame,
		continueRender,
		delayRender,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		environment.isClientSideRendering,
		fps,
		frame,
		id,
		logLevel,
		loop,
		loopVolumeCurveBehavior,
		muted,
		onVideoFrame,
		playbackRate,
		registerRenderAsset,
		src,
		startsAt,
		unregisterRenderAsset,
		volumeProp,
		replaceWithOffthreadVideo,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	if (replaceWithOffthreadVideo) {
		// TODO: Loop and other props
		return (
			<OffthreadVideo
				src={src}
				playbackRate={playbackRate}
				muted={muted}
				acceptableTimeShiftInSeconds={
					fallbackOffthreadVideoProps?.acceptableTimeShiftInSeconds
				}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				delayRenderRetries={delayRenderRetries}
				delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
				style={style}
				allowAmplificationDuringRender
				transparent={fallbackOffthreadVideoProps?.transparent}
				toneMapped={fallbackOffthreadVideoProps?.toneMapped}
				audioStreamIndex={fallbackOffthreadVideoProps?.audioStreamIndex}
				name={name}
				showInTimeline={showInTimeline}
				className={className}
				onVideoFrame={onVideoFrame}
				volume={volumeProp}
				id={id}
				onError={fallbackOffthreadVideoProps?.onError}
				toneFrequency={fallbackOffthreadVideoProps?.toneFrequency}
			/>
		);
	}

	return <canvas ref={canvasRef} style={style} className={classNameValue} />;
};
