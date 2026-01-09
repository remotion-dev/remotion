import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				scale: '1.35973',
			}}
		>
			<AbsoluteFill
				style={{
					transform: 'scale(0.5) translateY(1000px)',
				}}
			>
				<AbsoluteFill
					style={{
						transform:
							'matrix3d(0.304437, -0.106834, 0, 0.00012, 0.135913, 0.347567, 0, 0, 0, 0, 1, 0, 64, 140, 0, 1)',
						transformOrigin: '0px 0px',
						backgroundColor: 'black',
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const threeDFlattening = {
	component: Component,
	id: '3d-flattening',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 1,
} as const;
