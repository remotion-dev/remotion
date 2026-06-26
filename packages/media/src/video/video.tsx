import React, {useMemo, useState} from 'react';
import {
	Internals,
	Interactive,
	Sequence,
	useRemotionEnvironment,
	useVideoConfig,
	type SequenceControls,
	type InteractivitySchema,
} from 'remotion';
import {getLoopDisplay} from '../show-in-timeline';
import type {InnerVideoProps, VideoProps} from './props';
import {VideoForPreview} from './video-for-preview';
import {VideoForRendering} from './video-for-rendering';

const {validateMediaTrimProps, resolveTrimProps, validateMediaProps} =
	Internals;

const videoSchema = {
	...Internals.baseSchema,
	volume: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: 1,
		description: 'Volume',
		hiddenFromList: false,
	},
	playbackRate: {
		type: 'number',
		min: 0.1,
		step: 0.01,
		default: 1,
		description: 'Playback rate',
		hiddenFromList: false,
		keyframable: false,
	},
	loop: {type: 'boolean', default: false, description: 'Loop'},
	...Internals.transformSchema,
} as const satisfies InteractivitySchema;

const InnerVideo: React.FC<
	InnerVideoProps & {
		readonly controls: SequenceControls | undefined;
		readonly setMediaDurationInSeconds: (durationInSeconds: number) => void;
		readonly refForOutline: React.RefObject<HTMLElement | null>;
	}
> = ({
	src,
	audioStreamIndex,
	className,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	disallowFallbackToOffthreadVideo,
	fallbackOffthreadVideoProps,
	logLevel,
	loop,
	loopVolumeCurveBehavior,
	muted,
	onVideoFrame,
	playbackRate,
	style,
	trimAfter,
	trimBefore,
	volume,
	stack,
	toneFrequency,
	showInTimeline,
	debugOverlay,
	headless,
	onError,
	credentials,
	requestInit,
	controls,
	objectFit,
	_experimentalInitiallyDrawCachedFrame,
	effects,
	setMediaDurationInSeconds,
	refForOutline,
	...props
}) => {
	const environment = useRemotionEnvironment();

	if (typeof src !== 'string') {
		throw new TypeError(
			`The \`<Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				src,
			)} instead.`,
		);
	}

	validateMediaTrimProps({
		startFrom: undefined,
		endAt: undefined,
		trimBefore,
		trimAfter,
	});

	const {trimBeforeValue, trimAfterValue} = resolveTrimProps({
		startFrom: undefined,
		endAt: undefined,
		trimBefore,
		trimAfter,
	});

	validateMediaProps({playbackRate, volume}, 'Video');

	if (environment.isRendering) {
		return (
			<VideoForRendering
				{...props}
				audioStreamIndex={audioStreamIndex ?? 0}
				className={className}
				delayRenderRetries={delayRenderRetries ?? null}
				delayRenderTimeoutInMilliseconds={
					delayRenderTimeoutInMilliseconds ?? null
				}
				disallowFallbackToOffthreadVideo={
					disallowFallbackToOffthreadVideo ?? false
				}
				fallbackOffthreadVideoProps={fallbackOffthreadVideoProps}
				logLevel={logLevel}
				loop={loop}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				muted={muted}
				onVideoFrame={onVideoFrame}
				playbackRate={playbackRate}
				src={src}
				stack={stack}
				style={style}
				volume={volume}
				toneFrequency={toneFrequency}
				trimAfterValue={trimAfterValue}
				trimBeforeValue={trimBeforeValue}
				headless={headless}
				onError={onError}
				credentials={credentials}
				requestInit={requestInit}
				objectFit={objectFit}
				effects={effects}
			/>
		);
	}

	return (
		<VideoForPreview
			{...props}
			setMediaDurationInSeconds={setMediaDurationInSeconds}
			audioStreamIndex={audioStreamIndex ?? 0}
			className={className}
			logLevel={logLevel}
			loop={loop}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior}
			muted={muted}
			onVideoFrame={onVideoFrame}
			playbackRate={playbackRate}
			src={src}
			style={style}
			volume={volume}
			showInTimeline={showInTimeline}
			trimAfter={trimAfterValue}
			trimBefore={trimBeforeValue}
			stack={stack ?? null}
			disallowFallbackToOffthreadVideo={disallowFallbackToOffthreadVideo}
			fallbackOffthreadVideoProps={fallbackOffthreadVideoProps}
			debugOverlay={debugOverlay ?? false}
			headless={headless ?? false}
			onError={onError}
			credentials={credentials}
			requestInit={requestInit}
			controls={controls}
			objectFit={objectFit}
			effects={effects}
			_experimentalInitiallyDrawCachedFrame={
				_experimentalInitiallyDrawCachedFrame
			}
			refForOutline={refForOutline}
		/>
	);
};

const VideoInner: React.FC<
	VideoProps & {
		readonly controls: SequenceControls | undefined;
	}
> = ({
	src,
	audioStreamIndex,
	className,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	disallowFallbackToOffthreadVideo,
	fallbackOffthreadVideoProps,
	logLevel,
	loop,
	loopVolumeCurveBehavior,
	muted,
	name,
	onVideoFrame,
	playbackRate,
	showInTimeline,
	style,
	trimAfter,
	trimBefore,
	volume,
	stack,
	toneFrequency,
	debugOverlay,
	headless,
	onError,
	credentials,
	requestInit,
	controls,
	objectFit,
	_experimentalInitiallyDrawCachedFrame,
	effects,
	durationInFrames,
	from,
	freeze,
	hidden,
	...props
}) => {
	const fallbackLogLevel = Internals.useLogLevel();
	const [mediaVolume] = Internals.useMediaVolumeState();
	const mediaStartsAt = Internals.useMediaStartsAt();
	const videoConfig = useVideoConfig();
	const sequenceDurationInFrames = Math.min(
		durationInFrames ?? Infinity,
		Math.max(0, videoConfig.durationInFrames - (from ?? 0)),
	);

	const basicInfo = Internals.useBasicMediaInTimeline({
		src,
		volume,
		playbackRate: playbackRate ?? 1,
		trimBefore,
		trimAfter,
		sequenceDurationInFrames,
		mediaType: 'video',
		displayName: name ?? '<Video>',
		mediaVolume,
		mediaStartsAt,
		loop: loop ?? false,
	});

	// TODO: Redundant with what we do in the Studio
	const [mediaDurationInSeconds, setMediaDurationInSeconds] = useState<
		number | null
	>(null);

	const loopDisplay = useMemo(
		() =>
			getLoopDisplay({
				loop: loop ?? false,
				mediaDurationInSeconds,
				playbackRate: playbackRate ?? 1,
				trimAfter,
				trimBefore,
				sequenceDurationInFrames,
				compFps: videoConfig.fps,
			}),
		[
			loop,
			mediaDurationInSeconds,
			playbackRate,
			trimAfter,
			trimBefore,
			sequenceDurationInFrames,
			videoConfig.fps,
		],
	);

	const isMedia = useMemo(
		() => ({
			type: 'video' as const,
			data: basicInfo,
		}),
		[basicInfo],
	);

	const memoizedEffects = Internals.useMemoizedEffects({
		effects: effects ?? [],
		overrideId: controls?.overrideId ?? null,
	});
	const memoizedEffectDefinitions = Internals.useMemoizedEffectDefinitions(
		effects ?? [],
	);
	const refForOutline = React.useRef<HTMLElement | null>(null);

	if (sequenceDurationInFrames === 0) {
		return null;
	}

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			durationInFrames={basicInfo.duration}
			freeze={freeze}
			_remotionInternalStack={stack}
			_remotionInternalIsMedia={isMedia}
			name={name ?? '<Video>'}
			_remotionInternalDocumentationLink={
				name === undefined
					? 'https://www.remotion.dev/docs/media/video'
					: undefined
			}
			controls={controls}
			_remotionInternalLoopDisplay={loopDisplay}
			_remotionInternalEffects={memoizedEffectDefinitions}
			outlineRef={refForOutline}
			showInTimeline={showInTimeline ?? true}
			hidden={hidden}
		>
			<InnerVideo
				{...props}
				audioStreamIndex={audioStreamIndex ?? 0}
				className={className}
				delayRenderRetries={delayRenderRetries ?? null}
				delayRenderTimeoutInMilliseconds={
					delayRenderTimeoutInMilliseconds ?? null
				}
				disallowFallbackToOffthreadVideo={
					disallowFallbackToOffthreadVideo ?? false
				}
				fallbackOffthreadVideoProps={fallbackOffthreadVideoProps ?? {}}
				logLevel={logLevel ?? fallbackLogLevel}
				loop={loop ?? false}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior ?? 'repeat'}
				muted={muted ?? false}
				onVideoFrame={onVideoFrame}
				playbackRate={playbackRate ?? 1}
				showInTimeline={showInTimeline ?? true}
				src={src}
				style={style ?? {}}
				trimAfter={trimAfter}
				trimBefore={trimBefore}
				volume={volume ?? 1}
				toneFrequency={toneFrequency ?? 1}
				stack={stack}
				debugOverlay={debugOverlay ?? false}
				headless={headless ?? false}
				onError={onError}
				credentials={credentials}
				requestInit={requestInit}
				controls={controls}
				objectFit={objectFit ?? 'contain'}
				_experimentalInitiallyDrawCachedFrame={
					_experimentalInitiallyDrawCachedFrame ?? false
				}
				effects={memoizedEffects}
				setMediaDurationInSeconds={setMediaDurationInSeconds}
				refForOutline={refForOutline}
			/>
		</Sequence>
	);
};

export const Video = Interactive.withSchema({
	Component: VideoInner,
	componentName: '<Video>',
	componentIdentity: 'dev.remotion.media.Video',
	schema: videoSchema,
	supportsEffects: true,
});

Internals.addSequenceStackTraces(Video);
