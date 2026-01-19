import {Composition} from 'remotion';
import {MyAnimation as FallingSpheresAnimation} from '../skills/3d/assets/falling-spheres';
import {
	COMPOSITION_HEIGHT,
	COMPOSITION_WIDTH,
	MyAnimation,
} from '../skills/charts/assets/animated-shapes';
import {MyAnimation as BarChartAnimation} from '../skills/charts/assets/bar-chart';
import {MyAnimation as CounterAnimation} from '../skills/example-counter/assets/example';
import {MyAnimation as LottieAnimation} from '../skills/lottie/assets/example';
import {MyAnimation as TextRotationAnimation} from '../skills/text-animations/assets/text-rotation';
import {MyAnimation as TypewriterAnimation} from '../skills/text-animations/assets/typewriter';
import {MyAnimation as WordCarouselAnimation} from '../skills/text-animations/assets/word-carousel';
import {MyAnimation as WordHighlightAnimation} from '../skills/text-animations/assets/word-highlight';

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="AnimatedShapes"
				component={MyAnimation}
				durationInFrames={100}
				fps={30}
				width={COMPOSITION_WIDTH}
				height={COMPOSITION_HEIGHT}
			/>
			<Composition
				id="LottieAnimation"
				component={LottieAnimation}
				durationInFrames={150}
				fps={30}
				width={1080}
				height={1080}
			/>
			<Composition
				id="Counter"
				component={CounterAnimation}
				durationInFrames={90}
				fps={30}
				width={1080}
				height={1080}
			/>
			<Composition
				id="TextRotation"
				component={TextRotationAnimation}
				durationInFrames={180}
				fps={30}
				width={1080}
				height={1080}
			/>
			<Composition
				id="FallingSpheres"
				component={FallingSpheresAnimation}
				durationInFrames={150}
				fps={30}
				width={1080}
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
				width={1080}
				height={1080}
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
