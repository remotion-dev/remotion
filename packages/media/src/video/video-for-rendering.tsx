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
	Loop,
	random,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {calculateLoopDuration} from '../../../core/src/calculate-loop';
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
	readonly trimBeforeValue: number | undefined;
	readonly trimAfterValue: number | undefined;
};

type FallbackToOffthreadVideo = {
	durationInSeconds: number | null;
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
	trimAfterValue,
	trimBeforeValue,
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
	const [replaceWithOffthreadVideo, setReplaceWithOffthreadVideo] = useState<
		FallbackToOffthreadVideo | false
	>(false);

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
			playbackRate,
			logLevel,
			includeAudio: shouldRenderAudio,
			includeVideo: window.remotion_videoEnabled,
			isClientSideRendering: environment.isClientSideRendering,
			loop,
			audioStreamIndex,
		})
			.then((result) => {
				if (result.type === 'unknown-container-format') {
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

					setReplaceWithOffthreadVideo({durationInSeconds: null});
					return;
				}

				if (result.type === 'cannot-decode') {
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

					setReplaceWithOffthreadVideo({
						durationInSeconds: result.durationInSeconds,
					});
					return;
				}

				if (result.type === 'network-error') {
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

					setReplaceWithOffthreadVideo({durationInSeconds: null});
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
					// In the case of https://discord.com/channels/809501355504959528/809501355504959531/1424400511070765086
					// A video that only starts at time 0.033sec
					// we shall not crash here but clear the canvas
					const context = canvasRef.current?.getContext('2d');
					if (context) {
						context.clearRect(
							0,
							0,
							context.canvas.width,
							context.canvas.height,
						);
					}
				}

				const volumePropsFrame = frameForVolumeProp({
					behavior: loopVolumeCurveBehavior,
					loop,
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
						toneFrequency,
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
		const fallback = (
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

		if (loop) {
			if (!replaceWithOffthreadVideo.durationInSeconds) {
				cancelRender(
					new Error(
						`Cannot render video ${src}: @remotion/media was unable to render, and fell back to <OffthreadVideo>. Also, "loop" was set, but <OffthreadVideo> does not support looping and @remotion/media could also not determine the duration of the video.`,
					),
				);
			}

			return (
				<Loop
					layout="none"
					durationInFrames={calculateLoopDuration({
						endAt: trimAfterValue,
						mediaDurationInFrames:
							replaceWithOffthreadVideo.durationInSeconds * fps,
						playbackRate,
						startFrom: trimBeforeValue,
					})}
				>
					{fallback}
				</Loop>
			);
		}

		return fallback;
	}

	return <canvas ref={canvasRef} style={style} className={classNameValue} />;
};
