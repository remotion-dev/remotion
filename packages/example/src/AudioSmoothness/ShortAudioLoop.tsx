import {Video} from '@remotion/media';
import {Composition, Sequence} from 'remotion';

const fps = 30;
const src = 'https://remotion.media/audio-shorter-than-video.mp4';

const ShortAudioLoop = () => {
	return (
		<Sequence from={-8 * fps} layout="none">
			<Video src={src} loop debugOverlay logLevel="verbose" />
		</Sequence>
	);
};

export const AudioSmoothnessShortAudioLoopComp = () => {
	return (
		<Composition
			id="audio-smoothness-short-audio-loop"
			component={ShortAudioLoop}
			width={320}
			height={180}
			fps={fps}
			durationInFrames={12 * fps}
		/>
	);
};
