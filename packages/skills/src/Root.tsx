import {Composition} from 'remotion';
import {
	COMPOSITION_HEIGHT,
	COMPOSITION_WIDTH,
	MyAnimation,
} from '../skills/example-animated-shapes/assets/example';

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
		</>
	);
};
