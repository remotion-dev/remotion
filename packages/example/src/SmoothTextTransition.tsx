import {StudioInternals} from '@remotion/studio';
import {SmoothTextTransitionVideo} from './SmoothTextTransition-video';

export const SmoothTextTransition = StudioInternals.createComposition({
	component: SmoothTextTransitionVideo,
	height: 100,
	width: 200,
	id: 'smooth-text',
	durationInFrames: 200,
	fps: 3,
});
