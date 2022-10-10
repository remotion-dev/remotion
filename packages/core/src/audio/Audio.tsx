import React, {forwardRef, useCallback, useContext, useReducer} from 'react';
import {getRemotionEnvironment} from '../get-environment';
import {Loop} from '../loop';
import {Sequence} from '../Sequence';
import {useVideoConfig} from '../use-video-config';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {durationReducer} from '../video/duration-state';
import {AudioForDevelopment} from './AudioForDevelopment';
import {AudioForRendering} from './AudioForRendering';
import type {RemotionAudioProps, RemotionMainAudioProps} from './props';
import {SharedAudioContext} from './shared-audio-tags';

const AudioRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps & RemotionMainAudioProps
> = (props, ref) => {
	const audioContext = useContext(SharedAudioContext);
	const {startFrom, endAt, ...otherProps} = props;
	const {loop, ...propsOtherThanLoop} = props;
	const {fps} = useVideoConfig();

	const [durations, setDurations] = useReducer(durationReducer, {});

	const onError: React.ReactEventHandler<HTMLAudioElement> = useCallback(
		(e) => {
			console.log(e.currentTarget.error);
			throw new Error(
				`Could not play audio with src ${otherProps.src}: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`
			);
		},
		[otherProps.src]
	);

	const onDuration = useCallback((src: string, durationInSeconds: number) => {
		setDurations({type: 'got-duration', durationInSeconds, src});
	}, []);

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
				<Audio {...otherProps} ref={ref} />
			</Sequence>
		);
	}

	if (loop && props.src && durations[props.src as string] !== undefined) {
		const duration = Math.floor(durations[props.src as string] * fps);
		return (
			<Loop durationInFrames={duration}>
				<Audio {...propsOtherThanLoop} ref={ref} />
			</Loop>
		);
	}

	validateMediaProps(props, 'Audio');

	if (getRemotionEnvironment() === 'rendering') {
		return (
			<AudioForRendering
				onDuration={onDuration}
				{...props}
				ref={ref}
				onError={onError}
			/>
		);
	}

	return (
		<AudioForDevelopment
			shouldPreMountAudioTags={
				audioContext !== null && audioContext.numberOfAudioTags > 0
			}
			{...props}
			ref={ref}
			onError={onError}
			onDuration={onDuration}
		/>
	);
};

export const Audio = forwardRef(AudioRefForwardingFunction);
