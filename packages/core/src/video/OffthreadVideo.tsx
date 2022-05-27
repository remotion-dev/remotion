import React from 'react';
import {getRemotionEnvironment} from '../get-environment';
import {Sequence} from '../sequencing';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {OffthreadVideoForRendering} from './OffthreadVideoForRendering';
import {OffthreadVideoProps, RemotionMainVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';

export const OffthreadVideo: React.FC<
	OffthreadVideoProps & RemotionMainVideoProps
> = (props) => {
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
				<OffthreadVideo {...otherProps} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (getRemotionEnvironment() === 'rendering') {
		return <OffthreadVideoForRendering {...otherProps} />;
	}

	return <VideoForDevelopment {...otherProps} />;
};
