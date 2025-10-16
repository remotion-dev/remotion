import React from 'react';
import {Internals, useRemotionEnvironment} from 'remotion';
import type {InnerVideoProps, VideoProps} from './props';
import {VideoForPreview} from './video-for-preview';
import {VideoForRendering} from './video-for-rendering';

const {validateMediaTrimProps, resolveTrimProps, validateMediaProps} =
	Internals;

const InnerVideo: React.FC<InnerVideoProps> = ({
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
	style,
	trimAfter,
	trimBefore,
	volume,
	stack,
	toneFrequency,
	showInTimeline,
	debugOverlay,
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
				name={name}
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
			/>
		);
	}

	return (
		<VideoForPreview
			audioStreamIndex={audioStreamIndex ?? 0}
			className={className}
			name={name}
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
		/>
	);
};

export const Video: React.FC<VideoProps> = ({
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
}) => {
	return (
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
			logLevel={
				logLevel ??
				(typeof window !== 'undefined' ? window.remotion_logLevel : 'info')
			}
			loop={loop ?? false}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior ?? 'repeat'}
			muted={muted ?? false}
			name={name}
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
		/>
	);
};

Internals.addSequenceStackTraces(Video);
