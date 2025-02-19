import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {Img} from '../Img.js';
import {RenderAssetManager} from '../RenderAssetManager.js';
import {SequenceContext} from '../SequenceContext.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame.js';
import {cancelRender} from '../cancel-render.js';
import {OFFTHREAD_VIDEO_CLASS_NAME} from '../default-css.js';
import {continueRender, delayRender} from '../delay-render.js';
import {random} from '../random.js';
import {useTimelinePosition} from '../timeline-position-state.js';
import {truthy} from '../truthy.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config.js';
import {evaluateVolume} from '../volume-prop.js';
import {getExpectedMediaFrameUncorrected} from './get-current-time.js';
import {getOffthreadVideoSource} from './offthread-video-source.js';
import type {OffthreadVideoProps} from './props.js';

type SrcAndHandle = {
	src: string;
	handle: ReturnType<typeof delayRender>;
};

export const OffthreadVideoForRendering: React.FC<OffthreadVideoProps> = ({
	onError,
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	allowAmplificationDuringRender,
	transparent = false,
	toneMapped = true,
	toneFrequency,
	name,
	loopVolumeCurveBehavior,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	onVideoFrame,
	// Remove crossOrigin prop during rendering
	// https://discord.com/channels/809501355504959528/844143007183667220/1311639632496033813
	crossOrigin,
	...props
}) => {
	const absoluteFrame = useTimelinePosition();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);
	const videoConfig = useUnsafeVideoConfig();
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);

	if (!src) {
		throw new TypeError('No `src` was passed to <OffthreadVideo>.');
	}

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`offthreadvideo-${random(
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

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
		allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
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
			allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
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
		allowAmplificationDuringRender,
		toneFrequency,
		sequenceContext?.relativeFrom,
	]);

	const currentTime = useMemo(() => {
		return (
			getExpectedMediaFrameUncorrected({
				frame,
				playbackRate: playbackRate || 1,
				startFrom: -mediaStartsAt,
			}) / videoConfig.fps
		);
	}, [frame, mediaStartsAt, playbackRate, videoConfig.fps]);

	const actualSrc = useMemo(() => {
		return getOffthreadVideoSource({
			src,
			currentTime,
			transparent,
			toneMapped,
		});
	}, [toneMapped, currentTime, src, transparent]);

	const [imageSrc, setImageSrc] = useState<SrcAndHandle | null>(null);

	useLayoutEffect(() => {
		if (!window.remotion_videoEnabled) {
			return;
		}

		const cleanup: Function[] = [];

		setImageSrc(null);
		const controller = new AbortController();

		const newHandle = delayRender(`Fetching ${actualSrc} from server`, {
			retries: delayRenderRetries ?? undefined,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds ?? undefined,
		});

		const execute = async () => {
			try {
				const res = await fetch(actualSrc, {
					signal: controller.signal,
					cache: 'no-store',
				});
				if (res.status !== 200) {
					if (res.status === 500) {
						const json = await res.json();
						if (json.error) {
							const cleanedUpErrorMessage = (json.error as string).replace(
								/^Error: /,
								'',
							);

							throw new Error(cleanedUpErrorMessage);
						}
					}

					throw new Error(
						`Server returned status ${res.status} while fetching ${actualSrc}`,
					);
				}

				const blob = await res.blob();

				const url = URL.createObjectURL(blob);
				cleanup.push(() => URL.revokeObjectURL(url));
				setImageSrc({
					src: url,
					handle: newHandle,
				});
			} catch (err) {
				// If component is unmounted, we should not throw
				if ((err as Error).message.includes('aborted')) {
					continueRender(newHandle);
					return;
				}

				if (controller.signal.aborted) {
					continueRender(newHandle);
					return;
				}

				if ((err as Error).message.includes('Failed to fetch')) {
					// eslint-disable-next-line no-ex-assign
					err = new Error(
						`Failed to fetch ${actualSrc}. This could be caused by Chrome rejecting the request because the disk space is low. Consider increasing the disk size of your environment.`,
						{cause: err},
					);
				}

				if (onError) {
					onError(err as Error);
				} else {
					cancelRender(err);
				}
			}
		};

		execute();

		cleanup.push(() => {
			if (controller.signal.aborted) {
				return;
			}

			controller.abort();
		});

		return () => {
			cleanup.forEach((c) => c());
		};
	}, [
		actualSrc,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		onError,
	]);

	const onErr: React.ReactEventHandler<HTMLVideoElement | HTMLImageElement> =
		useCallback(() => {
			if (onError) {
				onError?.(new Error('Failed to load image with src ' + imageSrc));
			} else {
				cancelRender('Failed to load image with src ' + imageSrc);
			}
		}, [imageSrc, onError]);

	const className = useMemo(() => {
		return [OFFTHREAD_VIDEO_CLASS_NAME, props.className]
			.filter(truthy)
			.join(' ');
	}, [props.className]);

	const onImageFrame = useCallback(
		(img: HTMLImageElement) => {
			if (onVideoFrame) {
				onVideoFrame(img);
			}
		},
		[onVideoFrame],
	);

	if (!imageSrc || !window.remotion_videoEnabled) {
		return null;
	}

	continueRender(imageSrc.handle);

	return (
		<Img
			src={imageSrc.src}
			className={className}
			delayRenderRetries={delayRenderRetries}
			delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
			onImageFrame={onImageFrame}
			{...props}
			onError={onErr}
		/>
	);
};
