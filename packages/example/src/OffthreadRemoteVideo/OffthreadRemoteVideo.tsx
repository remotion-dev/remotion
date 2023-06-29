import {interpolate, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<OffthreadVideo
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src={staticFile('nofps.webm')}
		/>
	);
};
