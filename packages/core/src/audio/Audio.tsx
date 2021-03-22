import React from 'react';
import {Sequence} from '../sequencing';
import {AudioForDevelopment} from './AudioForDevelopment';
import {RemotionAudioProps, RemotionMainAudioProps} from './props';

export const Audio: React.FC<RemotionAudioProps & RemotionMainAudioProps> = (
	props
) => {
	const {startAt, endAt, ...otherProps} = props;
	if (typeof startAt !== 'undefined' || typeof endAt !== 'undefined') {
		const startAtFrameNo = startAt ? startAt : 0;
		const endAtFrameNO = endAt ? endAt : Infinity;
		return (
			<Sequence from={0 - startAtFrameNo} durationInFrames={endAtFrameNO}>
				<Audio {...otherProps} />
			</Sequence>
		);
	}
	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} />;
	}
	return null;
};
