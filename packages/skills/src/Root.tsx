import {Composition} from 'remotion';
import {MyAnimation as BarChartAnimation} from '../skills/remotion/rules/assets/charts-bar-chart';
import {MyAnimation as TextRotationAnimation} from '../skills/remotion/rules/assets/text-animations-text-rotation';
import {MyAnimation as TypewriterAnimation} from '../skills/remotion/rules/assets/text-animations-typewriter';
import {MyAnimation as WordCarouselAnimation} from '../skills/remotion/rules/assets/text-animations-word-carousel';
import {MyAnimation as WordHighlightAnimation} from '../skills/remotion/rules/assets/text-animations-word-highlight';

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="TextRotation"
				component={TextRotationAnimation}
				durationInFrames={180}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="BarChart"
				component={BarChartAnimation}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="Typewriter"
				component={TypewriterAnimation}
				durationInFrames={180}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fullText: 'From prompt to motion graphics. This is Remotion.',
					pauseAfter: 'From prompt to motion graphics.',
				}}
			/>
			<Composition
				id="WordHighlight"
				component={WordHighlightAnimation}
				durationInFrames={90}
				fps={30}
				width={1080}
				height={1080}
			/>
			<Composition
				id="WordCarousel"
				component={WordCarouselAnimation}
				durationInFrames={200}
				fps={30}
				width={1080}
				height={1080}
			/>
		</>
	);
};
