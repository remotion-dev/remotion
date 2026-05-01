import {useMemo, useState} from 'react';
import React from 'react';
import {
	useVideoConfig,
	type SequenceControls,
	type SequenceSchema,
} from 'remotion';
import {Internals, Sequence, useRemotionEnvironment} from 'remotion';
import {getLoopDisplay} from '../show-in-timeline';
import type {InnerVideoProps, VideoProps} from './props';
import {VideoForPreview} from './video-for-preview';
import {VideoForRendering} from './video-for-rendering';

const {validateMediaTrimProps, resolveTrimProps, validateMediaProps} =
	Internals;

const videoSchema = {
	volume: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: 1,
		description: 'Volume',
	},
	playbackRate: {
		type: 'number',
		min: 0.1,
		step: 0.01,
		default: 1,
		description: 'Playback Rate',
	},
	loop: {type: 'boolean', default: false, description: 'Loop'},
	'style.translate': {
		type: 'translate',
		step: 1,
		default: '0px 0px',
		description: 'Position',
	},
	'style.scale': {
		type: 'number',
		min: 0.05,
		max: 100,
		step: 0.01,
		default: 1,
		description: 'Scale',
	},
	'style.rotate': {
		type: 'rotation',
		step: 1,
		default: '0deg',
		description: 'Rotation',
	},
	'style.opacity': {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Opacity',
	},
} as const satisfies SequenceSchema;

const InnerVideo: React.FC<
	InnerVideoProps & {
		readonly _experimentalControls: SequenceControls | undefined;
		readonly setMediaDurationInSeconds: (durationInSeconds: number) => void;
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
	_experimentalControls: controls,
	objectFit,
	_experimentalInitiallyDrawCachedFrame,
	_experimentalEffects,
	setMediaDurationInSeconds,
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
				objectFit={objectFit}
			/>
		);
	}

	return (
		<VideoForPreview
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
			controls={controls}
			objectFit={objectFit}
			_experimentalEffects={_experimentalEffects}
			_experimentalInitiallyDrawCachedFrame={
				_experimentalInitiallyDrawCachedFrame
			}
		/>
	);
};

const VideoInner: React.FC<
	VideoProps & {
		readonly _experimentalControls: SequenceControls | undefined;
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
	_experimentalControls: controls,
	objectFit,
	_experimentalInitiallyDrawCachedFrame,
	_experimentalEffects,
	durationInFrames,
	from,
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

	if (sequenceDurationInFrames === 0) {
		return null;
	}

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			durationInFrames={basicInfo.duration}
			_remotionInternalStack={stack}
			_remotionInternalIsMedia={isMedia}
			name={name ?? '<Video>'}
			_experimentalControls={controls}
			_remotionInternalLoopDisplay={loopDisplay}
			showInTimeline={showInTimeline ?? true}
		>
			<InnerVideo
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
				_experimentalControls={controls}
				objectFit={objectFit ?? 'contain'}
				_experimentalInitiallyDrawCachedFrame={
					_experimentalInitiallyDrawCachedFrame ?? false
				}
				_experimentalEffects={_experimentalEffects ?? []}
				setMediaDurationInSeconds={setMediaDurationInSeconds}
			/>
		</Sequence>
	);
};

export const Video = Internals.wrapInSchema(VideoInner, videoSchema);

Internals.addSequenceStackTraces(Video);
