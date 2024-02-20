import {Loop, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<Loop durationInFrames={15 * 30}>
			<OffthreadVideo src={staticFile('vid1.mp4')} />
		</Loop>
	);
};

export const OffthreadLocalVideo: React.FC<{
	src: string;
}> = ({}) => {
	return <OffthreadVideo src={staticFile('hdrtest.mkv')} />;
};
