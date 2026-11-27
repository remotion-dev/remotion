import {AbsoluteFill} from 'remotion';

type Dimensions = {
	readonly width: number | string;
	readonly height: number | string;
};

const Shapes = ({width, height}: Dimensions) => (
	<svg width={width} height={height} style={{minWidth: 0, minHeight: 0}}>
		<style>{`
			rect.width-marker, rect.height-marker { fill: blue; }
			svg[width="${width}"] > rect.width-marker { fill: #ee7755; }
			svg[height="${height}"] > rect.height-marker { fill: #33aacc; }
		`}</style>
		<rect width={320} height={100} fill="#113355" />
		<rect x={8} y={16} width={140} height={20} fill="#33aacc" />
		<rect x={24} y={48} width={100} height={28} fill="#ee7755" />
		<rect className="width-marker" x={156} y={16} width={12} height={20} />
		<rect className="height-marker" x={156} y={48} width={12} height={20} />
	</svg>
);

export const SvgLayoutViewportCase = ({width, height}: Dimensions) => (
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
			<Shapes width={width} height={height} />
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
			<Shapes width={width} height={height} />
		</div>
	</AbsoluteFill>
);

const Component = () => <SvgLayoutViewportCase width={320} height={100} />;

export const svgLayoutViewport = {
	component: Component,
	id: 'svg-layout-viewport',
	width: 320,
	height: 240,
	fps: 30,
	durationInFrames: 1,
} as const;
