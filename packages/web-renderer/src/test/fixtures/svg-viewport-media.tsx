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
		<svg
			width={320}
			height={100}
			style={{position: 'absolute', left: 8, top: 88, width: 160, height: 50}}
		>
			<style>{`
				@media (min-width: 1px) {
					.physical-radius {
						width: 100%; height: 100%; background: red; direction: rtl;
						border-radius: 10%; border-start-start-radius: 30%;
						border-top-right-radius: 10%;
					}
				}
			`}</style>
			<foreignObject width="100%" height="100%">
				<div className="physical-radius" />
			</foreignObject>
		</svg>
		<svg
			width={320}
			height={100}
			style={{position: 'absolute', left: 208, top: 8, width: 160, height: 50}}
		>
			<style media="(min-width: 300px)">
				{'.outer-active { fill: lime; }'}
			</style>
			<style media="(max-width: 200px)">
				{'.outer-inactive { fill: red; }'}
			</style>
			<rect className="outer-active" fill="blue" width={160} height={25} />
			<rect
				className="outer-inactive"
				fill="blue"
				y={25}
				width={160}
				height={25}
			/>
		</svg>
		<svg
			width={320}
			height={100}
			style={{position: 'absolute', left: 208, top: 88, width: 160, height: 50}}
		>
			<style>{`@media (min-width: 1px) {
				.explicit-radius { width: 160px; height: 50px; background: red; direction: rtl;
				border-radius: 10%; border-start-start-radius: 30%; border-top-right-radius: 10%; }
			}`}</style>
			<foreignObject width="100%" height="100%">
				<div className="explicit-radius" />
			</foreignObject>
		</svg>
	</AbsoluteFill>
);

export const svgViewportMedia = {
	component: Component,
	id: 'svg-viewport-media',
	width: 400,
	height: 160,
	fps: 30,
	durationInFrames: 1,
} as const;
