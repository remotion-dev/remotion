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
					backgroundColor: 'red',
					width: 50,
					height: 50,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 10,
					left: 10,
					fontSize: 12,
					fontFamily: 'Arial',
					color: 'black',
				}}
			>
				Scale Test
			</div>
		</AbsoluteFill>
	);
};

export const scaleFixture = {
	component: Component,
	id: 'scale-test',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 1,
} as const;
