import React, {forwardRef, useCallback, useContext} from 'react';
import {getAbsoluteSrc} from '../absolute-src.js';
import {useRemotionEnvironment} from '../get-environment.js';
import {Loop} from '../loop/index.js';
import {Sequence} from '../Sequence.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateMediaProps} from '../validate-media-props.js';
import {validateStartFromProps} from '../validate-start-from-props.js';
import {DurationsContext} from './duration-state.js';
import type {RemotionMainVideoProps, RemotionVideoProps} from './props.js';
import {VideoForDevelopment} from './VideoForDevelopment.js';
import {VideoForRendering} from './VideoForRendering.js';

const VideoForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps & RemotionMainVideoProps
> = (props, ref) => {
	const {startFrom, endAt, ...otherProps} = props;
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
				props.src
			)} instead.`
		);
	}

	const onDuration = useCallback(
		(src: string, durationInSeconds: number) => {
			setDurations({type: 'got-duration', durationInSeconds, src});
		},
		[setDurations]
	);

	if (loop && props.src && durations[getAbsoluteSrc(props.src)] !== undefined) {
		const naturalDuration = durations[getAbsoluteSrc(props.src)] * fps;
		const playbackRate = props.playbackRate ?? 1;
		const durationInFrames = Math.floor(naturalDuration / playbackRate);

		return (
			<Loop durationInFrames={durationInFrames}>
				<Video {...propsOtherThanLoop} ref={ref} />
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
			>
				<Video {...otherProps} ref={ref} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment === 'rendering') {
		return (
			<VideoForRendering onDuration={onDuration} {...otherProps} ref={ref} />
		);
	}

	return (
		<VideoForDevelopment
			onlyWarnForMediaSeekingError={false}
			{...otherProps}
			ref={ref}
			onDuration={onDuration}
		/>
	);
};

const forward = forwardRef as <T, P = {}>(
	render: (
		props: P,
		ref: React.MutableRefObject<T>
	) => React.ReactElement | null
) => (props: P & React.RefAttributes<T>) => React.ReactElement | null;

/**
 * @description allows you to include a video file in your Remotion project. It wraps the native HTMLVideoElement.
 * @see [Documentation](https://www.remotion.dev/docs/video)
 */
export const Video = forward(VideoForwardingFunction);
