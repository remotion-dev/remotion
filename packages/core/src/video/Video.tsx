import React from 'react';
import {Sequence} from '../sequencing';
import {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

export const Video: React.FC<RemotionVideoProps & RemotionMainVideoProps> = ({
	startAt,
	endAt,
	...props
}) => {
	const startAtFrameNo = startAt ? startAt : 0;
	const endAtFrameNO = endAt ? endAt : Infinity;
	if (process.env.NODE_ENV === 'development') {
		return (
			<Sequence
				from={0 - startAtFrameNo}
				durationInFrames={endAtFrameNO - startAtFrameNo}
			>
				<VideoForDevelopment {...props} />;
			</Sequence>
		);
	}
	return (
		<Sequence
			from={0 - startAtFrameNo}
			durationInFrames={endAtFrameNO - startAtFrameNo}
		>
			<VideoForRendering {...props} />;
		</Sequence>
	);
};
