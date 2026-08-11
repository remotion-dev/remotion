import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				transform: `scale(2)`,
				justifyContent: 'flex-end',
				alignItems: 'flex-end',
			}}
		>
			<svg
				width="100"
				height="100"
				viewBox="0 0 100 100"
				style={{transform: 'scale(0.5)'}}
			>
				<rect
					x="0"
					y="0"
					width="100"
					height="100"
					fill="rgba(12, 133, 243, 1)"
				/>
			</svg>
		</AbsoluteFill>
	);
};

export const flexPositionedScaled = {
	component: Component,
	id: 'flex-positioned-scaled',
	width: 200,
	height: 200,
	fps: 30,
	durationInFrames: 100,
} as const;
