import {OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return <OffthreadVideo toneFrequency={1.6} src={staticFile('vid1.mp4')} />;
};

export const OffthreadLocalVideo: React.FC<{
	src: string;
}> = ({src}) => {
	return <OffthreadVideo src={staticFile(src)} />;
};
