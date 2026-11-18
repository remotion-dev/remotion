import {AbsoluteFill} from 'remotion';

export const filterColorSpaceModes = ['srgb', 'p3', 'oklab', 'lab'] as const;
const colors = {
	srgb: ['color(srgb 0 0 1)', 'blue'],
	p3: ['color(display-p3 0 0 0)', 'black'],
	oklab: ['oklab(0 0 0)', 'black'],
	lab: ['lab(0% 0 0)', 'black'],
} as const;

export const filterColorSpaceShadow = (
	mode: (typeof filterColorSpaceModes)[number],
	literal: boolean,
) => {
	const Component = () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<div
				style={{
					position: 'absolute',
					left: -100,
					top: 80,
					width: 50,
					height: 50,
					backgroundColor: 'red',
					filter: `drop-shadow(150px 0 0 ${colors[mode][literal ? 1 : 0]})`,
				}}
			/>
		</AbsoluteFill>
	);
	return {
		component: Component,
		id: `filter-color-space-${mode}-${literal ? 'literal' : 'authored'}`,
		width: 300,
		height: 220,
		durationInFrames: 1,
		fps: 30,
	} as const;
};
