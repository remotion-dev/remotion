/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {forwardRef, useCallback, useContext} from 'react';
import {Sequence} from '../Sequence.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {calculateLoopDuration} from '../calculate-loop.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {getRemotionEnvironment} from '../get-remotion-environment.js';
import {Loop} from '../loop/index.js';
import {usePreload} from '../prefetch.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateMediaProps} from '../validate-media-props.js';
import {validateStartFromProps} from '../validate-start-from-props.js';
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
	const environment = getRemotionEnvironment();

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
				durationInFrames={calculateLoopDuration({
					endAt,
					mediaDuration,
					playbackRate: props.playbackRate ?? 1,
					startFrom,
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

	if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
		validateStartFromProps(startFrom, endAt);

		const startFromFrameNo = startFrom ?? 0;
		const endAtFrameNo = endAt ?? Infinity;
		return (
			<Sequence
				layout="none"
				from={0 - startFromFrameNo}
				showInTimeline={false}
				durationInFrames={endAtFrameNo}
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

	validateMediaProps(props, 'Video');

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
