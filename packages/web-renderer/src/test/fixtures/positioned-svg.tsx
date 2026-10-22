import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg
				width={20}
				height={20}
				viewBox="0 0 20 20"
				style={{
					position: 'absolute',
					left: 20,
					top: 20,
					translate: '20px 20px',
					scale: 2,
					transformOrigin: '0 0',
				}}
			>
				<rect width={20} height={20} fill="red" />
			</svg>
		</AbsoluteFill>
	);
};

export const positionedSvg = {
	component: Component,
	id: 'positioned-svg',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 1,
} as const;
