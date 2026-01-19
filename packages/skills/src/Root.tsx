import {Composition} from 'remotion';
import {
	COMPOSITION_HEIGHT,
	COMPOSITION_WIDTH,
	MyAnimation,
} from '../skills/charts/assets/animated-shapes';
import {MyAnimation as BarChartAnimation} from '../skills/charts/assets/bar-chart';
import {MyAnimation as ChatMessagesAnimation} from '../skills/example-chat-messages/assets/example';
import {MyAnimation as CounterAnimation} from '../skills/example-counter/assets/example';
import {MyAnimation as FallingSpheresAnimation} from '../skills/example-falling-spheres/assets/example';
import {MyAnimation as HistogramAnimation} from '../skills/example-histogram/assets/example';
import {MyAnimation as ProgressBarAnimation} from '../skills/example-progress-bar/assets/example';
import {MyAnimation as StaggeredListAnimation} from '../skills/example-staggered-list/assets/example';
import {MyAnimation as TextRotationAnimation} from '../skills/example-text-rotation/assets/example';
import {MyAnimation as TypewriterHighlightAnimation} from '../skills/example-typewriter-highlight/assets/example';
import {MyAnimation as WordCarouselAnimation} from '../skills/example-word-carousel/assets/example';
import {MyAnimation as LottieAnimation} from '../skills/lottie/assets/example';

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
				id="Histogram"
				component={HistogramAnimation}
				durationInFrames={90}
				fps={30}
				width={1080}
				height={1080}
			/>
			<Composition
				id="ProgressBar"
				component={ProgressBarAnimation}
				durationInFrames={90}
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
				id="ChatMessages"
				component={ChatMessagesAnimation}
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
				id="TypewriterHighlight"
				component={TypewriterHighlightAnimation}
				durationInFrames={180}
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
			<Composition
				id="StaggeredList"
				component={StaggeredListAnimation}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={1080}
			/>
		</>
	);
};
