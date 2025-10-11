import {Html5Video, interpolate, Loop} from 'remotion';

const InfinityVideo: React.FC = () => {
	return (
		<Loop durationInFrames={10 * 30 * 60}>
			<Html5Video
				volume={(f) =>
					interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
				}
				src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
			/>
		</Loop>
	);
};

export default InfinityVideo;
