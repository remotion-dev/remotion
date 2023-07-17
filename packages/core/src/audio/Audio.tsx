import React, {forwardRef, useCallback, useContext} from 'react';
import {getAbsoluteSrc} from '../absolute-src.js';
import {cancelRender} from '../cancel-render.js';
import {useRemotionEnvironment} from '../get-environment.js';
import {Loop} from '../loop/index.js';
import {Sequence} from '../Sequence.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateMediaProps} from '../validate-media-props.js';
import {validateStartFromProps} from '../validate-start-from-props.js';
import {DurationsContext} from '../video/duration-state.js';
import {AudioForDevelopment} from './AudioForDevelopment.js';
import {AudioForRendering} from './AudioForRendering.js';
import type {RemotionAudioProps, RemotionMainAudioProps} from './props.js';
import {SharedAudioContext} from './shared-audio-tags.js';

const AudioRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps & RemotionMainAudioProps
> = (props, ref) => {
	const audioContext = useContext(SharedAudioContext);
	const {startFrom, endAt, ...otherProps} = props;
	const {loop, ...propsOtherThanLoop} = props;
	const {fps} = useVideoConfig();
	const environment = useRemotionEnvironment();

	const {durations, setDurations} = useContext(DurationsContext);

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src
			)} instead.`
		);
	}

	const onError: React.ReactEventHandler<HTMLAudioElement> = useCallback(
		(e) => {
			console.log(e.currentTarget.error);
			cancelRender(
				new Error(
					`Could not play audio with src ${otherProps.src}: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`
				)
			);
		},
		[otherProps.src]
	);

	const onDuration = useCallback(
		(src: string, durationInSeconds: number) => {
			setDurations({type: 'got-duration', durationInSeconds, src});
		},
		[setDurations]
	);

	if (loop && props.src && durations[getAbsoluteSrc(props.src)] !== undefined) {
		const duration = Math.floor(durations[getAbsoluteSrc(props.src)] * fps);
		const playbackRate = props.playbackRate ?? 1;
		const actualDuration = duration / playbackRate;

		return (
			<Loop layout="none" durationInFrames={Math.floor(actualDuration)}>
				<Audio {...propsOtherThanLoop} ref={ref} />
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
				<Audio {...otherProps} ref={ref} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Audio');

	if (environment === 'rendering') {
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

/**
 * @description With this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.
 * @see [Documentation](https://www.remotion.dev/docs/audio)
 */
export const Audio = forwardRef(AudioRefForwardingFunction);
