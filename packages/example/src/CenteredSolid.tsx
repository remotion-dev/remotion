import {fisheye} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {halftone} from '@remotion/effects/halftone';
import React from 'react';
import {
	AbsoluteFill,
	Solid,
	interpolate,
	useCurrentFrame,
	Easing,
} from 'remotion';

const CenteredSolid: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{perspective: 300}}>
			<Solid
				width={1080}
				height={1080}
				color={'rgba(221, 0, 0, 0.75)'}
				effects={[
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
				style={{
					translate: interpolate(frame, [16, 32], ['0px 0px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [Easing.bezier(0.3645, -2, 0.6496, 3)],
					}),
				}}
			/>
			<Solid
				width={1080}
				height={1080}
				style={{
					position: 'absolute',
				}}
				color={'rgba(221, 0, 0, 0)'}
			/>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
