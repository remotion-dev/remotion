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
	Internals,
	Loop,
	random,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {useMaxMediaCacheSize} from '../caches';
import {applyVolume} from '../convert-audiodata/apply-volume';
import {TARGET_SAMPLE_RATE} from '../convert-audiodata/resample-audiodata';
import {frameForVolumeProp} from '../looped-frame';
import {extractFrameViaBroadcastChannel} from '../video-extraction/extract-frame-via-broadcast-channel';
import type {
	FallbackOffthreadVideoProps,
	MediaErrorAction,
	MediaErrorEvent,
} from './props';

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
	readonly headless: boolean;
	readonly onError:
		| ((event: MediaErrorEvent) => MediaErrorAction | undefined)
		| undefined;
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
	headless,
	onError,
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
	const {delayRender, continueRender, cancelRender} = useDelayRender();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [replaceWithOffthreadVideo, setReplaceWithOffthreadVideo] = useState<
		FallbackToOffthreadVideo | false
	>(false);

	const audioEnabled = Internals.useAudioEnabled();
	const videoEnabled = Internals.useVideoEnabled();

	const maxCacheSize = useMaxMediaCacheSize(logLevel);

	const [error, setError] = useState<Error | null>(null);

	if (error) {
		throw error;
	}

	useLayoutEffect(() => {
		if (!canvasRef.current && !headless) {
			return;
		}

		if (replaceWithOffthreadVideo) {
			return;
		}

		if (!canvasRef.current?.getContext && !headless) {
			return setError(
				new Error(
					'Canvas does not have .getContext() method available. This could be because <Video> was mounted inside an <svg> tag.',
				),
			);
		}

		const timestamp = frame / fps;
		const durationInSeconds = 1 / fps;

		const newHandle = delayRender(`Extracting frame at time ${timestamp}`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		const shouldRenderAudio = (() => {
			if (!audioEnabled) {
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
			includeVideo: videoEnabled,
			isClientSideRendering: environment.isClientSideRendering,
			loop,
			audioStreamIndex,
			trimAfter: trimAfterValue,
			trimBefore: trimBeforeValue,
			fps,
			maxCacheSize,
		})
			.then((result) => {
				const handleError = (
					err: Error,
					clientSideError: Error,
					fallbackMessage: string,
					mediaDurationInSeconds: number | null,
				) => {
					if (environment.isClientSideRendering) {
						cancelRender(clientSideError);
						return;
					}

					if (onError) {
						const action =
							onError({error: err}) ??
							(disallowFallbackToOffthreadVideo ? 'fail' : 'fallback');

						if (action === 'fail') {
							cancelRender(err);
							return;
						}

						// action === 'fallback'
						if (window.remotion_isMainTab) {
							Internals.Log.warn(
								{logLevel, tag: '@remotion/media'},
								fallbackMessage,
							);
						}

						setReplaceWithOffthreadVideo({
							durationInSeconds: mediaDurationInSeconds,
						});
						return;
					}

					if (disallowFallbackToOffthreadVideo) {
						cancelRender(err);
						return;
					}

					if (window.remotion_isMainTab) {
						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							fallbackMessage,
						);
					}

					setReplaceWithOffthreadVideo({
						durationInSeconds: mediaDurationInSeconds,
					});
				};

				if (result.type === 'unknown-container-format') {
					handleError(
						new Error(`Unknown container format ${src}.`),
						new Error(
							`Cannot render video "${src}": Unknown container format. See supported formats: https://www.remotion.dev/docs/mediabunny/formats`,
						),
						`Unknown container format for ${src} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <OffthreadVideo>`,
						null,
					);
					return;
				}

				if (result.type === 'cannot-decode') {
					handleError(
						new Error(`Cannot decode ${src}.`),
						new Error(
							`Cannot render video "${src}": The video could not be decoded by the browser.`,
						),
						`Cannot decode ${src}, falling back to <OffthreadVideo>`,
						result.durationInSeconds,
					);
					return;
				}

				if (result.type === 'cannot-decode-alpha') {
					handleError(
						new Error(`Cannot decode alpha component for ${src}.`),
						new Error(
							`Cannot render video "${src}": The alpha channel could not be decoded by the browser.`,
						),
						`Cannot decode alpha component for ${src}, falling back to <OffthreadVideo>`,
						result.durationInSeconds,
					);
					return;
				}

				if (result.type === 'network-error') {
					handleError(
						new Error(`Network error fetching ${src}.`),
						new Error(
							`Cannot render video "${src}": Network error while fetching the video (possibly CORS).`,
						),
						`Network error fetching ${src} (no CORS?), falling back to <OffthreadVideo>`,
						null,
					);
					return;
				}

				const {
					frame: imageBitmap,
					audio,
					durationInSeconds: assetDurationInSeconds,
				} = result;

				if (imageBitmap) {
					onVideoFrame?.(imageBitmap);
					const context = canvasRef.current?.getContext('2d', {
						alpha: true,
					});
					// Could be in headless mode
					if (context) {
						context.canvas.width = imageBitmap.width;
						context.canvas.height = imageBitmap.height;

						context.canvas.style.aspectRatio = `${context.canvas.width} / ${context.canvas.height}`;
						context.drawImage(imageBitmap, 0, 0);
					}

					imageBitmap.close();
				} else if (videoEnabled) {
					// A video that only starts at time 0.033sec
					// we shall not crash here but clear the canvas
					const context = canvasRef.current?.getContext('2d', {
						alpha: true,
					});
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
						audio: environment.isClientSideRendering
							? audio.data
							: Array.from(audio.data),
						frame: absoluteFrame,
						timestamp: audio.timestamp,
						duration: (audio.numberOfFrames / TARGET_SAMPLE_RATE) * 1_000_000,
						toneFrequency,
					});
				}

				continueRender(newHandle);
			})
			.catch((err) => {
				cancelRender(err);
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
		trimAfterValue,
		trimBeforeValue,
		audioEnabled,
		videoEnabled,
		maxCacheSize,
		cancelRender,
		headless,
		onError,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	if (replaceWithOffthreadVideo) {
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
				transparent={fallbackOffthreadVideoProps?.transparent ?? true}
				toneMapped={fallbackOffthreadVideoProps?.toneMapped ?? true}
				audioStreamIndex={audioStreamIndex ?? 0}
				name={name}
				className={className}
				onVideoFrame={onVideoFrame}
				volume={volumeProp}
				id={id}
				onError={fallbackOffthreadVideoProps?.onError}
				toneFrequency={toneFrequency}
				// these shouldn't matter during rendering / should not appear at all
				showInTimeline={false}
				crossOrigin={undefined}
				onAutoPlayError={() => undefined}
				pauseWhenBuffering={false}
				trimAfter={trimAfterValue}
				trimBefore={trimBeforeValue}
				useWebAudioApi={false}
				startFrom={undefined}
				endAt={undefined}
				stack={stack}
				_remotionInternalNativeLoopPassed={false}
			/>
		);

		if (loop) {
			if (!replaceWithOffthreadVideo.durationInSeconds) {
				const err = new Error(
					`Cannot render video ${src}: @remotion/media was unable to render, and fell back to <OffthreadVideo>. Also, "loop" was set, but <OffthreadVideo> does not support looping and @remotion/media could also not determine the duration of the video.`,
				);

				cancelRender(err);

				throw err;
			}

			return (
				<Loop
					layout="none"
					durationInFrames={Internals.calculateMediaDuration({
						trimAfter: trimAfterValue,
						mediaDurationInFrames:
							replaceWithOffthreadVideo.durationInSeconds * fps,
						playbackRate,
						trimBefore: trimBeforeValue,
					})}
				>
					{fallback}
				</Loop>
			);
		}

		return fallback;
	}

	if (headless) {
		return null;
	}

	return <canvas ref={canvasRef} style={style} className={classNameValue} />;
};
