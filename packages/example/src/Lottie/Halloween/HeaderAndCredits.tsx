import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import './common.css';

const HeaderAndCredits = ({author}: {readonly author: string}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	const opacity = interpolate(
		frame,
		[0, 5, durationInFrames - 20, durationInFrames],
		[0, 1, 1, 0],
	);
	const scale = spring({
		fps,
		frame,
		from: 0.25,
		to: 1,
		config: {
			damping: 100,
			mass: 0.5,
		},
	});
	const posY = interpolate(frame, [0, 10], [100, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill className="content" style={{opacity}}>
			<h1 style={{transform: `scale(${scale})`}}>Happy Halloween!</h1>
			<span style={{transform: `translateY(${posY}%)`}}>
				Animation by {author}
			</span>
		</AbsoluteFill>
	);
};

export default HeaderAndCredits;
