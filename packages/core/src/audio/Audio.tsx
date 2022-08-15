import React, {forwardRef, useCallback, useContext} from 'react';
import {getRemotionEnvironment} from '../get-environment';
import {Sequence} from '../Sequence';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
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

	const onError: React.ReactEventHandler<HTMLAudioElement> = useCallback(
		(e) => {
			console.log(e.currentTarget.error);
			throw new Error(
				`Could not play audio with src ${otherProps.src}: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`
			);
		},
		[otherProps.src]
	);

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

	if (getRemotionEnvironment() === 'rendering') {
		return <AudioForRendering {...props} ref={ref} onError={onError} />;
	}

	return (
		<AudioForDevelopment
			shouldPreMountAudioTags={
				audioContext !== null && audioContext.numberOfAudioTags > 0
			}
			{...props}
			ref={ref}
			onError={onError}
		/>
	);
};

export const Audio = forwardRef(AudioRefForwardingFunction);
