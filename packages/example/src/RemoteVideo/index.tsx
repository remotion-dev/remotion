import {Caption, interpolate, staticFile, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	return (
		<>
			<Caption language="eng" src={staticFile('subs.srt')} title="Some title" />
			<Caption src={staticFile('subs_alt.srt')} />
			<Video
				volume={(f) =>
					interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
				}
				src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
			/>
		</>
	);
};

export default RemoteVideo;
