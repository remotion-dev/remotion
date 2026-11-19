import {AbsoluteFill} from 'remotion';

const Component = () => (
	<AbsoluteFill style={{background: 'white'}}>
		<svg
			width={320}
			height={100}
			style={{position: 'absolute', left: 8, top: 8, width: 160, height: 50}}
		>
			<style>{`
				.matches { fill: red; }
				.does-not-match { fill: blue; }
				.nested { fill: purple; }
				@media (min-width: 300px) { .matches { fill: lime; } }
				@media (max-width: 200px) { .does-not-match { fill: red; } }
				@supports (display: block) {
					@media (min-width: 300px) { .nested { fill: orange; } }
				}
			`}</style>
			<rect className="matches" width={160} height={20} />
			<rect className="does-not-match" y={30} width={100} height={20} />
			<rect className="nested" x={100} y={30} width={60} height={20} />
		</svg>
	</AbsoluteFill>
);

export const svgViewportMedia = {
	component: Component,
	id: 'svg-viewport-media',
	width: 400,
	height: 80,
	fps: 30,
	durationInFrames: 1,
} as const;
