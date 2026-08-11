import {interpolate, OffthreadVideo} from 'remotion';

const CorruptVideo: React.FC = () => {
	return (
		<OffthreadVideo
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src="https://remotion.media/corrupted.mp4"
		/>
	);
};

export default CorruptVideo;
