/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {forwardRef, useCallback, useContext} from 'react';
import {Sequence} from '../Sequence.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {calculateMediaDuration} from '../calculate-media-duration.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {Loop} from '../loop/index.js';
import {usePreload} from '../prefetch.js';
import {useRemotionEnvironment} from '../use-remotion-environment.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateMediaProps} from '../validate-media-props.js';
import {
	resolveTrimProps,
	validateMediaTrimProps,
} from '../validate-start-from-props.js';
import {VideoForPreview} from './VideoForPreview.js';
import {VideoForRendering} from './VideoForRendering.js';
import {DurationsContext} from './duration-state.js';
import type {RemotionMainVideoProps, RemotionVideoProps} from './props';

const VideoForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps &
		RemotionMainVideoProps & {
			/**
			 * @deprecated For internal use only
			 */
			readonly stack?: string;
		}
> = (props, ref) => {
	const {
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
		name,
		pauseWhenBuffering,
		stack,
		_remotionInternalNativeLoopPassed,
		showInTimeline,
		onAutoPlayError,
		...otherProps
	} = props;
	const {loop, ...propsOtherThanLoop} = props;
	const {fps} = useVideoConfig();
	const environment = useRemotionEnvironment();

	const {durations, setDurations} = useContext(DurationsContext);

	if (typeof ref === 'string') {
		throw new Error('string refs are not supported');
	}

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	const preloadedSrc = usePreload(props.src);

	const onDuration = useCallback(
		(src: string, durationInSeconds: number) => {
			setDurations({type: 'got-duration', durationInSeconds, src});
		},
		[setDurations],
	);

	const onVideoFrame = useCallback(() => {}, []);

	const durationFetched =
		durations[getAbsoluteSrc(preloadedSrc)] ??
		durations[getAbsoluteSrc(props.src)];

	validateMediaTrimProps({startFrom, endAt, trimBefore, trimAfter});
	const {trimBeforeValue, trimAfterValue} = resolveTrimProps({
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
	});

	if (loop && durationFetched !== undefined) {
		if (!Number.isFinite(durationFetched)) {
			return (
				<Video
					{...propsOtherThanLoop}
					ref={ref}
					_remotionInternalNativeLoopPassed
				/>
			);
		}

		const mediaDuration = durationFetched * fps;

		return (
			<Loop
				durationInFrames={calculateMediaDuration({
					trimAfter: trimAfterValue,
					mediaDurationInFrames: mediaDuration,
					playbackRate: props.playbackRate ?? 1,
					trimBefore: trimBeforeValue,
				})}
				layout="none"
				name={name}
			>
				<Video
					{...propsOtherThanLoop}
					ref={ref}
					_remotionInternalNativeLoopPassed
				/>
			</Loop>
		);
	}

	if (
		typeof trimBeforeValue !== 'undefined' ||
		typeof trimAfterValue !== 'undefined'
	) {
		return (
			<Sequence
				layout="none"
				from={0 - (trimBeforeValue ?? 0)}
				showInTimeline={false}
				durationInFrames={trimAfterValue}
				name={name}
			>
				<Video
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
					ref={ref}
				/>
			</Sequence>
		);
	}

	validateMediaProps(
		{playbackRate: props.playbackRate, volume: props.volume},
		'Video',
	);

	if (environment.isRendering) {
		return (
			<VideoForRendering
				onDuration={onDuration}
				onVideoFrame={onVideoFrame ?? null}
				{...otherProps}
				ref={ref}
			/>
		);
	}

	return (
		<VideoForPreview
			onlyWarnForMediaSeekingError={false}
			{...otherProps}
			ref={ref}
			onVideoFrame={null}
			// Proposal: Make this default to true in v5
			pauseWhenBuffering={pauseWhenBuffering ?? false}
			onDuration={onDuration}
			_remotionInternalStack={stack ?? null}
			_remotionInternalNativeLoopPassed={
				_remotionInternalNativeLoopPassed ?? false
			}
			showInTimeline={showInTimeline ?? true}
			onAutoPlayError={onAutoPlayError ?? undefined}
		/>
	);
};

/*
 * @description Wraps the native `<video>` element to include video in your component that is synchronized with Remotion's time.
 * @see [Documentation](https://www.remotion.dev/docs/video)
 */
export const Video = forwardRef(VideoForwardingFunction);

addSequenceStackTraces(Video);
