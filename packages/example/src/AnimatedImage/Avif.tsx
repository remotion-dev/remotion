import {StudioInternals} from '@remotion/studio';
import {AvifVideo} from './Avif-video';

export const AnimatedImages = StudioInternals.createComposition({
	component: AvifVideo,
	id: 'animated-images',
	width: 2400,
	height: 1080,
	durationInFrames: 200,
	fps: 30,
});
