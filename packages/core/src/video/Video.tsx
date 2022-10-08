import React, {forwardRef, useCallback, useReducer} from 'react';
import {getRemotionEnvironment} from '../get-environment';
import {Loop} from '../loop';
import {Sequence} from '../Sequence';
import {useVideoConfig} from '../use-video-config';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {durationReducer} from './duration-state';
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

	const [durations, setDurations] = useReducer(durationReducer, {});

	if (typeof ref === 'string') {
		throw new Error('string refs are not supported');
	}

	const onDuration = useCallback((src: string, durationInSeconds: number) => {
		setDurations({type: 'got-duration', durationInSeconds, src});
	}, []);

	if (loop && props.src && durations[props.src as string] !== undefined) {
		return (
			<Loop durationInFrames={Math.round(durations[props.src as string] * fps)}>
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

	if (getRemotionEnvironment() === 'rendering') {
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

export const Video = forwardRef(VideoForwardingFunction);
