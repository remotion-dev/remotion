import {AbsoluteFill} from 'remotion';
import {SvgLayoutViewportCase} from './svg-layout-viewport';

const dimensions = [
	[320, 100],
	['+320', '+100'],
	['3.2e2', '1e2'],
	['.32e3', '.1e3'],
	[' 320 ', ' 100 '],
	['320px', '100px'],
	[`${(320 * 2.54) / 96}cm`, `${(100 * 2.54) / 96}cm`],
	[`${(320 * 25.4) / 96}mm`, `${(100 * 25.4) / 96}mm`],
	[`${320 / 96}in`, `${100 / 96}in`],
	['240pt', '75pt'],
	['20pc', '6.25pc'],
	['320.0000', '100.0000'],
	[0, 100],
	[320, 0],
] as const;

const Component = () => (
	<AbsoluteFill style={{background: 'white'}}>
		<style>{'.svg-zero-dimension svg { width: 320px; height: 100px; }'}</style>
		{dimensions.map(([width, height], index) => (
			<div
				key={`${typeof width}:${width}:${height}`}
				className={width === 0 || height === 0 ? 'svg-zero-dimension' : ''}
				data-svg-length-case={index}
				style={{
					position: 'absolute',
					left: (index % 5) * 196,
					top: Math.floor(index / 5) * 216,
					width: 196,
					height: 216,
				}}
			>
				<SvgLayoutViewportCase width={width} height={height} />
			</div>
		))}
	</AbsoluteFill>
);

export const svgViewportLengthValues = {
	component: Component,
	id: 'svg-viewport-length-values',
	width: 980,
	height: 648,
	fps: 30,
	durationInFrames: 1,
} as const;
