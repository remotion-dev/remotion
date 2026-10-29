import {Interactive} from 'remotion';
import {
	AnimatedCaptions as SharedAnimatedCaptions,
	CAPTIONS_HEIGHT,
	type CaptionsTheme,
} from '../components/AnimatedCaptions';
import {VOICEOVER_SRC} from './voiceover';
import {voiceoverCaptions} from './voiceover-captions';

export const CAPTIONS_DURATION_IN_FRAMES = 1608;
export {CAPTIONS_HEIGHT};

const AnimatedCaptionsInner: React.FC<{
	readonly theme?: CaptionsTheme;
}> = ({theme = 'dark'}) => (
	<SharedAnimatedCaptions
		captions={voiceoverCaptions}
		captionsSrc={null}
		voiceoverSrc={VOICEOVER_SRC}
		theme={theme}
	/>
);

export const AnimatedCaptions = Interactive.create({
	Component: AnimatedCaptionsInner,
	layout: 'absolute-fill',
});
