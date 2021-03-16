import {Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	return (
		<Video
			style={{
				transform: `rotate(180deg)`,
			}}
			src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
		/>
	);
};

export default RemoteVideo;
