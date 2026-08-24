import {
	AnimatedCaptions as SharedAnimatedCaptions,
	CAPTIONS_HEIGHT,
} from '../components/AnimatedCaptions';
import {asset} from './assets';

export const VOICEOVER_FILE = 'text-behind-video-2.wav';
export const CAPTIONS_FILE = 'voiceover-captions.json';
export const CAPTIONS_DURATION_IN_FRAMES = 1816;
export {CAPTIONS_HEIGHT};

export const AnimatedCaptions: React.FC = () => {
	return (
		<SharedAnimatedCaptions
			captionsSrc={asset(CAPTIONS_FILE)}
			voiceoverSrc={asset(VOICEOVER_FILE)}
		/>
	);
};
