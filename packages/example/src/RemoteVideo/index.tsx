import {staticFile, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	return <Video src={staticFile('ending.mp4')} />;
};

export default RemoteVideo;
