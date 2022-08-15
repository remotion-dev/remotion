import {Caption, interpolate, Video} from 'remotion';

const RemoteVideo: React.FC = () => {
	return (
		<>
			<Caption
				language="eng"
				src="http://127.0.0.1:8080/subs.srt"
				title="Some title"
			/>
			<Caption src="http://127.0.0.1:8080/subs_alt.srt" />
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
