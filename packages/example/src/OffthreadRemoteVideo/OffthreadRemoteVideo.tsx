import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<AbsoluteFill>
			<OffthreadVideo src={staticFile('bigbuckbunny.mp4')} />
		</AbsoluteFill>
	);
};
