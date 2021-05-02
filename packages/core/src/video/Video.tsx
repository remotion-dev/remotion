import React, {forwardRef} from 'react';
import {UnsupportedCodecError} from '../custom-errors';
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

	const onError = () => {
		throw new UnsupportedCodecError(
			'Unsupported video codec found. Make sure your browser supports the codec or use chrome.'
		);
	};

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
		return <VideoForDevelopment {...props} ref={ref} onError={onError} />;
	}

	return <VideoForRendering {...props} ref={ref} onError={onError} />;
};

export const Video = forwardRef(VideoForwardingFunction);
