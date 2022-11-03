import {interpolate, OffthreadVideo, staticFile} from 'remotion';

const CorruptVideo: React.FC = () => {
	return (
		<OffthreadVideo
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src={staticFile('corrupted.mp4')}
		/>
	);
};

export default CorruptVideo;
