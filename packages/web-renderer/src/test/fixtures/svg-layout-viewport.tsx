import {AbsoluteFill} from 'remotion';

const Shapes = () => (
	<svg width={320} height={100} style={{minWidth: 0, minHeight: 0}}>
		<rect width={320} height={100} fill="#113355" />
		<rect x={8} y={16} width={140} height={20} fill="#33aacc" />
		<rect x={24} y={50} width={100} height={28} fill="#ee7755" />
	</svg>
);

const Component = () => (
	<AbsoluteFill style={{background: 'white'}}>
		<div
			style={{
				position: 'absolute',
				left: 12,
				top: 8,
				width: 180,
				height: 72,
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<Shapes />
		</div>
		<div
			style={{
				position: 'absolute',
				left: 12,
				top: 104,
				width: 180,
				height: 100,
				display: 'flex',
				flexDirection: 'row',
				overflow: 'hidden',
			}}
		>
			<Shapes />
		</div>
	</AbsoluteFill>
);

export const svgLayoutViewport = {
	component: Component,
	id: 'svg-layout-viewport',
	width: 320,
	height: 240,
	fps: 30,
	durationInFrames: 1,
} as const;
