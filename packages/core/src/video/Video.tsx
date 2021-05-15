import React, {forwardRef, useCallback} from 'react';
import {Sequence} from '../sequencing';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {RemotionMainVideoProps, RemotionVideoProps} from './props';
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
				<Video {...otherProps} ref={ref} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (process.env.NODE_ENV === 'development') {
		return <VideoForDevelopment {...otherProps} ref={ref} />;
	}

	return <VideoForRendering {...otherProps} ref={ref} />;
};

export const Video = forwardRef(VideoForwardingFunction);
