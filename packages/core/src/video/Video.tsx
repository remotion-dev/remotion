import React, {forwardRef} from 'react';
import {getRemotionEnvironment} from '../get-environment';
import {Sequence} from '../Sequence';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import type {RemotionMainVideoProps, RemotionVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';
import {VideoForRendering} from './VideoForRendering';

const VideoForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps & RemotionMainVideoProps
> = (props, ref) => {
	const {startFrom, endAt, ...otherProps} = props;

	if (typeof ref === 'string') {
		throw new Error('string refs are not supported');
	}

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
				<Video {...otherProps} ref={ref} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (getRemotionEnvironment() === 'rendering') {
		return <VideoForRendering {...otherProps} ref={ref} />;
	}

	return (
		<VideoForDevelopment
			onlyWarnForMediaSeekingError={false}
			{...otherProps}
			ref={ref}
		/>
	);
};

export const Video = forwardRef(VideoForwardingFunction);
