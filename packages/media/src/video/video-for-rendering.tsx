import React, {
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	VolumeProp,
} from 'remotion';
import {
	cancelRender,
	Internals,
	random,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {frameForVolumeProp} from '../looped-frame';
import {extractFrameViaBroadcastChannel} from '../video-extraction/extract-frame-via-broadcast-channel';
import type {FallbackOffthreadVideoProps} from './props';

// TODO: Combining `loop` + trimAfter / trimBefore
// is not consistent across preview and rendering
type InnerVideoProps = {
	readonly className: string | undefined;
	readonly loop: boolean;
	readonly src: string;
	readonly logLevel: LogLevel;
	readonly muted: boolean;
	readonly name: string | undefined;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	readonly onVideoFrame: OnVideoFrame | undefined;
	readonly playbackRate: number;
	readonly style: React.CSSProperties;
	readonly delayRenderRetries: number | null;
	readonly delayRenderTimeoutInMilliseconds: number | null;
	readonly fallbackOffthreadVideoProps: FallbackOffthreadVideoProps;
	readonly audioStreamIndex: number;
	readonly disallowFallbackToOffthreadVideo: boolean;
	readonly stack: string | undefined;
	readonly toneFrequency: number;
};

export const VideoForRendering: React.FC<InnerVideoProps> = ({
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	loopVolumeCurveBehavior,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	onVideoFrame,
	logLevel,
	loop,
	style,
	className,
	fallbackOffthreadVideoProps,
	audioStreamIndex,
	name,
	disallowFallbackToOffthreadVideo,
	stack,
	toneFrequency,
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
	const sequenceContext = useContext(Internals.SequenceContext);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`media-video-${random(
				src,
			)}-${sequenceContext?.cumulatedFrom}-${sequenceContext?.relativeFrom}-${sequenceContext?.durationInFrames}`,
		[
			src,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		],
	);

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
			audioStreamIndex: audioStreamIndex ?? 0,
		})
			.then((result) => {
				if (result === 'unknown-container-format') {
					if (disallowFallbackToOffthreadVideo) {
						cancelRender(
							new Error(
								`Unknown container format ${src}, and 'disallowFallbackToOffthreadVideo' was set. Failing the render.`,
							),
						);
					}

					if (window.remotion_isMainTab) {
						Internals.Log.info(
							{logLevel, tag: '@remotion/media'},
							`Unknown container format for ${src} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <OffthreadVideo>`,
						);
					}

					setReplaceWithOffthreadVideo(true);
					return;
				}

				if (result === 'cannot-decode') {
					if (disallowFallbackToOffthreadVideo) {
						cancelRender(
							new Error(
								`Cannot decode ${src}, and 'disallowFallbackToOffthreadVideo' was set. Failing the render.`,
							),
						);
					}

					if (window.remotion_isMainTab) {
						Internals.Log.info(
							{logLevel, tag: '@remotion/media'},
							`Cannot decode ${src}, falling back to <OffthreadVideo>`,
						);
					}

					setReplaceWithOffthreadVideo(true);
					return;
				}

				if (result === 'network-error') {
					if (disallowFallbackToOffthreadVideo) {
						cancelRender(
							new Error(
								`Cannot decode ${src}, and 'disallowFallbackToOffthreadVideo' was set. Failing the render.`,
							),
						);
					}

					if (window.remotion_isMainTab) {
						Internals.Log.info(
							{logLevel, tag: '@remotion/media'},
							`Network error fetching ${src}, falling back to <OffthreadVideo>`,
						);
					}

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
						toneFrequency: toneFrequency ?? 1,
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
		audioStreamIndex,
		disallowFallbackToOffthreadVideo,
		toneFrequency,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	if (replaceWithOffthreadVideo) {
		// TODO: Loop and other props
		return (
			<Internals.InnerOffthreadVideo
				src={src}
				playbackRate={playbackRate ?? 1}
				muted={muted ?? false}
				acceptableTimeShiftInSeconds={
					fallbackOffthreadVideoProps?.acceptableTimeShiftInSeconds
				}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior ?? 'repeat'}
				delayRenderRetries={delayRenderRetries ?? undefined}
				delayRenderTimeoutInMilliseconds={
					delayRenderTimeoutInMilliseconds ?? undefined
				}
				style={style}
				allowAmplificationDuringRender
				transparent={fallbackOffthreadVideoProps?.transparent ?? false}
				toneMapped={fallbackOffthreadVideoProps?.toneMapped ?? true}
				audioStreamIndex={audioStreamIndex ?? 0}
				name={name}
				className={className}
				onVideoFrame={onVideoFrame}
				volume={volumeProp}
				id={id}
				onError={fallbackOffthreadVideoProps?.onError}
				toneFrequency={fallbackOffthreadVideoProps?.toneFrequency ?? 1}
				// these shouldn't matter during rendering / should not appear at all
				showInTimeline={false}
				crossOrigin={undefined}
				onAutoPlayError={() => undefined}
				pauseWhenBuffering={false}
				trimAfter={undefined}
				trimBefore={undefined}
				useWebAudioApi={false}
				startFrom={undefined}
				endAt={undefined}
				stack={stack}
				_remotionInternalNativeLoopPassed={false}
			/>
		);
	}

	return <canvas ref={canvasRef} style={style} className={classNameValue} />;
};
