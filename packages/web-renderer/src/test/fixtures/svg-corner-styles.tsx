import type {CSSProperties} from 'react';
import {useLayoutEffect, useRef} from 'react';
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

export const svgCornerDeclarationMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40">
<style>[style] { box-sizing: border-box; } .rule-corner { width: 40px; height: 40px; background: red; border-radius: 12px; corner-shape: bevel; } @media all { .unused[data-token="{"] { padding: var(--gap); content: "{not a block}"; border-radius: 12px; corner-shape: bevel; } }</style>
<foreignObject width="40" height="40"><div xmlns="http://www.w3.org/1999/xhtml" data-inline-corner="" style="--gap: 4px; --paint: green; --edge: 2px solid blue; width: 40px; height: 40px; padding: var(--gap); background: var(--paint) !important; border: var(--edge); border-radius: 12px; corner-shape: bevel;"><div style="width: 100%; height: 100%; background: white;" /></div></foreignObject>
<foreignObject x="40" width="40" height="40"><div xmlns="http://www.w3.org/1999/xhtml" class="rule-corner" /></foreignObject>
</svg>`;

const CornerDeclarations = () => {
	const host = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const parsed = new DOMParser().parseFromString(
			svgCornerDeclarationMarkup,
			'image/svg+xml',
		);
		const svg = document.importNode(parsed.documentElement, true);
		host.current!.appendChild(svg);
		return () => svg.remove();
	}, []);
	return (
		<div ref={host} style={{width: 80, height: 40, background: 'white'}} />
	);
};

export const svgCornerDeclarations = {
	component: CornerDeclarations,
	id: 'svg-corner-declarations',
	width: 80,
	height: 40,
	fps: 30,
	durationInFrames: 1,
} as const;
