import React, {forwardRef, useCallback} from 'react';
import {Sequence} from '../sequencing';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {AudioForDevelopment} from './AudioForDevelopment';
import {AudioForRendering} from './AudioForRendering';
import {RemotionAudioProps, RemotionMainAudioProps} from './props';

const AudioRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps & RemotionMainAudioProps
> = (props, ref) => {
	const {startFrom, endAt, ...otherProps} = props;

	const onError = useCallback(() => {
		throw new Error(`Could not play video with src ${otherProps.src}`);
	}, [otherProps.src]);

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

	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} ref={ref} onError={onError} />;
	}

	return <AudioForRendering {...props} ref={ref} onError={onError} />;
};

export const Audio = forwardRef(AudioRefForwardingFunction);
