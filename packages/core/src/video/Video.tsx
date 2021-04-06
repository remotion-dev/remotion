import React from 'react';
import {Sequence} from '../sequencing';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<RemotionVideoProps & RemotionMainVideoProps> = (
	props
) => {
	const {startAt, endAt, ...otherProps} = props;
	if (typeof startAt !== 'undefined' || typeof endAt !== 'undefined') {
		validateStartFromProps(startAt, endAt);

		const startAtFrameNo = startAt ?? 0;
		const endAtFrameNo = endAt ?? Infinity;
		return (
			<Sequence
				from={0 - startAtFrameNo}
				showInTimeline={false}
				durationInFrames={endAtFrameNo}
			>
				<Video {...otherProps} />
			</Sequence>
		);
	}
	validateMediaProps(props, 'Video');

	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...props} />;
	}
	return <VideoForRendering {...props} />;
};
