import {fisheye} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {halftone} from '@remotion/effects/halftone';
import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import {vignette} from '@remotion/effects/vignette';
import {starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Solid, interpolate, useCurrentFrame} from 'remotion';

const CenteredSolid: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{perspective: 300}}>
			<Solid
				width={1080}
				height={1080}
				style={{
					translate: '49.491px -42.297px',
					scale: 0.75,
					rotate: '8deg',
				}}
				color={'rgba(221, 0, 0, 0.75)'}
				effects={[
					starburst({
						rays: 23,
						rotation: interpolate(frame, [0, 59], [360, 0]),
						smoothness: 0,
						colors: ['#000000', '#ffffff'],
						origin: [0.47, 1],
					}),
					halftone({
						dotSize: 20,
						dotSpacing: 20,
						rotation: 0,
						offsetX: 0,
						offsetY: 0,
						shape: 'circle',
						invert: false,
						colorMode: 'solid',
						dotColor: 'red',
					}),
					glow({
						radius: 100,
						intensity: 1.7,
						color: '#ff0000',
					}),
					fisheye({
						fieldOfView: 2.73,
						center: [0.5, 0.5],
						radius: 0.41,
						zoom: 1,
					}),
				]}
			/>
			<Solid
				width={1080}
				height={1080}
				style={{
					translate: '95.444px 61.616px',
					scale: 0.75,
					rotate: '8deg',
					position: 'absolute',
				}}
				color={'rgba(221, 0, 0, 0)'}
				effects={[
					halftoneLinearGradient({
						firstStopDotSize: 0,
						secondStopDotSize: 40,
						firstStopPosition: [-0.34, 1.19],
						secondStopPosition: [0.97, 0.18],
						gridSize: 24,
						colorMode: 'solid',
						dotColor: 'black',
					}),
					vignette({
						amount: 0.96,
						radius: 0.54,
						feather: 0.35,
						roundness: 1,
						color: '#000000',
						mode: 'alpha',
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
