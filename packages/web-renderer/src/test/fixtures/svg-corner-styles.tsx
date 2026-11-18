import type {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';

export const svgCornerShapeValues = [
	'round',
	'square',
	'bevel',
	'notch',
	'scoop',
	'squircle',
	'superellipse(3)',
	'bevel notch scoop round',
] as const;

const Component = () => {
	const frame = useCurrentFrame();
	return (
		<svg width={384} height={192} viewBox="0 0 384 192">
			<foreignObject width={384} height={192}>
				<div
					style={{
						position: 'relative',
						width: 384,
						height: 192,
						backgroundColor: 'white',
					}}
				>
					{svgCornerShapeValues.map((cornerShape, index) => (
						<div
							key={cornerShape}
							style={
								{
									position: 'absolute',
									left: 12 + (index % 4) * 96,
									top: 12 + Math.floor(index / 4) * 96,
									width: 72,
									height: 72,
									backgroundColor: 'rgb(20, 80, 220)',
									borderRadius:
										frame === 0
											? '24px 12px 20px 16px / 12px 24px 16px 20px'
											: '12px 24px 16px 20px / 24px 12px 20px 16px',
									cornerShape,
								} as CSSProperties
							}
						/>
					))}
				</div>
			</foreignObject>
		</svg>
	);
};

export const svgCornerStyles = {
	component: Component,
	id: 'svg-corner-styles',
	width: 384,
	height: 192,
	fps: 30,
	durationInFrames: 2,
} as const;
