import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				transform: 'rotate(25deg)',
				transformOrigin: '10px 10px',
			}}
		>
			<svg
				viewBox="0 0 100 100"
				width="100"
				height="100"
				style={{
					transform: 'rotate(-25deg) scale(0.8)',
					transformOrigin: '90px 10px',
				}}
			>
				<polygon points="50,10 90,90 10,90" fill="orange" />
			</svg>
		</AbsoluteFill>
	);
};

export const pixelTransformOrigin = {
	component: Component,
	id: 'pixel-transform-origin',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 100,
} as const;
