import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					backgroundColor: 'red',
					width: 100,
					height: 100,
					borderRadius: 20,
				}}
			/>
		</AbsoluteFill>
	);
};

export const backgroundColor = {
	component: Component,
	id: 'background-color',
	width: 200,
	height: 200,
	fps: 25,
	durationInFrames: 1,
} as const;
