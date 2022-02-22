import {interpolate, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	return (
		<Video
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
		/>
	);
};

export default RemoteVideo;
