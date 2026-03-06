import {fontFamily, loadFont} from '@remotion/google-fonts/Bangers';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont();

export const MoneyBurn: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const enter = spring({
		fps,
		frame,
		config: {
			damping: 20,
		},
	});

	const spr = spring({
		fps,
		frame: frame - 20,
		config: {
			damping: 200,
		},
		durationInFrames: 30,
	});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 300,
				fontFamily,
			}}
		>
			<div
				style={{
					backgroundImage: 'linear-gradient(red, purple)',
					filter: `drop-shadow(0 20px 40px rgba(255, 0, 0, 0.2)) drop-shadow(0 20px 40px rgba(255, 0, 0, 0.8)) blur(${
						spr * 20
					}px)`,
					scale: String(enter),
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					marginTop: interpolate(spr, [0, 1], [0, -400]),
					opacity: 1 - spr,
				}}
			>
				-80$
			</div>
		</AbsoluteFill>
	);
};
