import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div
				style={{
					fontSize: 8,
					fontFamily: 'Arial',
					color: 'black',
					padding: 5,
					backgroundColor: '#f0f0f0',
					borderRadius: 3,
					transform: 'translateZ(1px) rotateY(45deg) rotateX(45deg)',
				}}
			>
				Precompose Test
			</div>
		</AbsoluteFill>
	);
};

export const scalePrecomposeFixture = {
	component: Component,
	id: 'scale-precompose-test',
	width: 80,
	height: 80,
	fps: 30,
	durationInFrames: 1,
} as const;
