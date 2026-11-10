import {Audio, Video} from '@remotion/media';
import {staticFile} from 'remotion';

const Component: React.FC = () => (
	<>
		<Video
			src={staticFile('video.mp4') + '?offline-recovery'}
			delayRenderTimeoutInMilliseconds={5000}
		/>
		<Audio
			src={staticFile('dialogue.wav') + '?offline-recovery'}
			delayRenderTimeoutInMilliseconds={5000}
		/>
	</>
);

export const offlineRecovery = {
	component: Component,
	id: 'offline-recovery',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 3,
};
