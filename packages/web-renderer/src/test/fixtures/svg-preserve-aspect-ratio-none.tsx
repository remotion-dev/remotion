import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 400,
					height: 100,
				}}
			>
				<svg
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
					}}
				>
					<rect width={100} height={100} fill="red" />
					<path d="M0 0 L100 100" stroke="black" strokeWidth={4} />
				</svg>
			</div>
		</AbsoluteFill>
	);
};

export const svgPreserveAspectRatioNone = {
	component: Component,
	id: 'svg-preserve-aspect-ratio-none',
	width: 400,
	height: 100,
	fps: 30,
	durationInFrames: 1,
} as const;
