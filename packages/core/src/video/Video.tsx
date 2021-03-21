import React from 'react';
import {Sequence} from '../sequencing';
import {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<RemotionVideoProps & RemotionMainVideoProps> = (
	props
) => {
	const {startAt, endAt, ...otherProps} = props;
	const startAtFrameNo = startAt ? startAt : 0;
	const endAtFrameNO = endAt ? endAt : Infinity;
	if (startAt || endAt) {
		return (
			<Sequence
				from={0 - startAtFrameNo}
				durationInFrames={endAtFrameNO - startAtFrameNo}
			>
				<Video {...otherProps} />
			</Sequence>
		);
	}

	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...props} />;
	}
	return <VideoForRendering {...props} />;
};
