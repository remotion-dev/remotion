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
					width: 200,
					height: 50,
					borderRadius: 999,
					backgroundColor: 'teal',
					border: '1px solid #ff6dae',
				}}
			/>
		</AbsoluteFill>
	);
};

export const borderRadiusPill = {
	component: Component,
	id: 'border-radius-pill',
	width: 300,
	height: 150,
	fps: 25,
	durationInFrames: 1,
} as const;
