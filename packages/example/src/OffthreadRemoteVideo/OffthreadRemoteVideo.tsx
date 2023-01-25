import {interpolate, OffthreadVideo} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<OffthreadVideo
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
		/>
	);
};
