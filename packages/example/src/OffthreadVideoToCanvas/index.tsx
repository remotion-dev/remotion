import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadVideoToCanvas: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'red'}}>
			<OffthreadVideo muted src={staticFile('offthreadvideo.mp4')} />
		</AbsoluteFill>
	);
};
