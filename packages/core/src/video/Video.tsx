import React, {forwardRef, useCallback, useContext} from 'react';
import {useRemotionEnvironment} from '../get-environment';
import {Loop} from '../loop';
import {Sequence} from '../Sequence';
import {useVideoConfig} from '../use-video-config';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {DurationsContext} from './duration-state';
import type {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

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

	if (loop && props.src && durations[props.src as string] !== undefined) {
		const naturalDuration = durations[props.src as string] * fps;
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

export const Video = forward(VideoForwardingFunction);
