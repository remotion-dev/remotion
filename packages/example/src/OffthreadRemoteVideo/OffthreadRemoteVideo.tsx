import {Loop, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<Loop durationInFrames={9.5 * 60 * 30}>
			<OffthreadVideo src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
		</Loop>
	);
};

export const OffthreadLocalVideo: React.FC<{
	src: string;
}> = ({src}) => {
	return <OffthreadVideo src={staticFile(src)} />;
};
