import {CameraMotionBlur} from '@remotion/motion-blur';
import {interpolate, OffthreadVideo, staticFile} from 'remotion';

export const OffthreadRemoteVideo: React.FC = () => {
	return (
		<CameraMotionBlur samples={3} shutterAngle={180}>
			<OffthreadVideo src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
		</CameraMotionBlur>
	);
};

export const OffthreadLocalVideo: React.FC = () => {
	return (
		<OffthreadVideo
			volume={(f) =>
				interpolate(f, [0, 500], [1, 0], {extrapolateRight: 'clamp'})
			}
			src={staticFile('iphonevideo.mov')}
		/>
	);
};
