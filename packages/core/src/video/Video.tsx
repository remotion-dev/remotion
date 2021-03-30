import React from 'react';
import {Sequence} from '../sequencing';
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
				from={startAtFrameNo}
				durationInFrames={endAtFrameNo - startAtFrameNo}
			>
				<Sequence from={0 - startAtFrameNo} durationInFrames={Infinity}>
					<Video {...otherProps} />
				</Sequence>
			</Sequence>
		);
	}

	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...props} />;
	}
	return <VideoForRendering {...props} />;
};
