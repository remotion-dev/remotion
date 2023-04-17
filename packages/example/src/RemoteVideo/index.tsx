import {OffthreadVideo, staticFile} from 'remotion';

const RemoteVideo: React.FC = () => {
	return <OffthreadVideo src={staticFile('bigbuckbunny.mp4')} />;
};

export default RemoteVideo;
