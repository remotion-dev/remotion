import {AbsoluteFill} from 'remotion';

export const Component: React.FC = () => {
	return (
		<>
			<AbsoluteFill
				style={{
					opacity: 0.1,
				}}
			>
				<div>hi</div>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					backgroundColor: 'red',
				}}
			/>
		</>
	);
};

export const opacityReset = {
	component: Component,
	id: 'opacity-reset',
	width: 100,
	height: 100,
	fps: 25,
	durationInFrames: 1,
} as const;
