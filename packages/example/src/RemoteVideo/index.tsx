import {useRef} from 'react';
import {interpolate, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	const ref = useRef<HTMLVideoElement>(null);

	return (
		<Video
			ref={ref}
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
		/>
	);
};

export default RemoteVideo;
