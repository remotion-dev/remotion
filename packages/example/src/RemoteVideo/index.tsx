import {useRef} from 'react';
import {interpolate, useCurrentFrame, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const ref = useRef<HTMLVideoElement>(null);

	return (
		<Video
			ref={ref}
			volume={interpolate(frame, [0, 500], [1, 0], {extrapolateRight: 'clamp'})}
			src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
		/>
	);
};

export default RemoteVideo;
