import React from 'react';
import {Sequence} from '../sequencing';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {AudioForDevelopment} from './AudioForDevelopment';
import {AudioForRendering} from './AudioForRendering';
import {RemotionAudioProps, RemotionMainAudioProps} from './props';

export const Audio: React.FC<RemotionAudioProps & RemotionMainAudioProps> = (
	props
) => {
	const {startFrom, endAt, ...otherProps} = props;
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
				<Audio {...otherProps} />
			</Sequence>
		);
	}
	validateMediaProps(props, 'Audio');

	if (process.env.NODE_ENV === 'development') {
		return <AudioForDevelopment {...props} />;
	}
	return <AudioForRendering {...props} />;
};
