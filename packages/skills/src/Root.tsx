import {Composition} from 'remotion';
import {
	COMPOSITION_HEIGHT,
	COMPOSITION_WIDTH,
	MyAnimation,
} from '../skills/charts/assets/animated-shapes';
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
		</>
	);
};
