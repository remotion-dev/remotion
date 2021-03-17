import React from 'react';
import {Sequence} from '../sequencing';
import {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<RemotionVideoProps & RemotionMainVideoProps> = ({
	startAt,
	endTo,
	...props
}) => {
	const startAtFrameNo = startAt ? startAt : 0;
	const endToFrameNO = endTo ? endTo : Infinity;
	if (process.env.NODE_ENV === 'development') {
		return (
			<Sequence
				from={0 - startAtFrameNo}
				durationInFrames={endToFrameNO - startAtFrameNo}
			>
				<VideoForDevelopment {...props} />;
			</Sequence>
		);
	}
	return (
		<Sequence
			from={0 - startAtFrameNo}
			durationInFrames={endToFrameNO - startAtFrameNo}
		>
			<VideoForRendering {...props} />;
		</Sequence>
	);
};
