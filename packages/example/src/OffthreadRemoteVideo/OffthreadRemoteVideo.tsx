import {Audio, Loop, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<Loop durationInFrames={20 * 30}>
			<Audio src={staticFile('sine.wav')} />
		</Loop>
	);
};

export const OffthreadLocalVideo: React.FC<{
	src: string;
}> = ({src}) => {
	return <OffthreadVideo src={staticFile(src)} />;
};
