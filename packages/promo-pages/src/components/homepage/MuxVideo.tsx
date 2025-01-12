import React, {forwardRef, useRef} from 'react';
import {VideoPlayerWithControls} from './VideoPlayerWithControls';

const getVideoToPlayUrl = (muxId: string) => {
	return `https://stream.mux.com/${muxId}.mp4`;
};

const MuxVideoForward: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	React.DetailedHTMLProps<
		React.VideoHTMLAttributes<HTMLVideoElement>,
		HTMLVideoElement
	> & {
		readonly muxId: string;
	}
> = ({muxId, ...props}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const vidUrl = getVideoToPlayUrl(muxId);

	return <video ref={videoRef} src={vidUrl} {...props} />;
};

export const MuxVideo = forwardRef(MuxVideoForward);

export const NewMuxVideo: React.FC<{
	readonly muxId: string;
}> = ({muxId}) => {
	return (
		<VideoPlayerWithControls
			playbackId={muxId}
			poster={'https://image.mux.com/' + muxId + '/thumbnail.png?time=1'}
			onError={(error) => {
				console.log(error);
			}}
			onLoaded={() => undefined}
			onSize={() => undefined}
		/>
	);
};
