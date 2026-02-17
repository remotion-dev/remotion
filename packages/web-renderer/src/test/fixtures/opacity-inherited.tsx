import {AbsoluteFill} from 'remotion';

export const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				opacity: 0.25,
				borderRadius: 40,
			}}
		>
			<AbsoluteFill
				style={{
					backgroundColor: 'red',
				}}
			/>
		</AbsoluteFill>
	);
};

export const opacityInherited = {
	component: Component,
	id: 'opacity-inherited',
	width: 100,
	height: 100,
	fps: 25,
	durationInFrames: 1,
} as const;
