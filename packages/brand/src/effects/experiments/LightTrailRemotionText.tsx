import {pattern} from '@remotion/effects/pattern';
import React from 'react';
import {
	Easing,
	HtmlInCanvas,
	Img,
	interpolate,
	Solid,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const container: React.CSSProperties = {};

export const LightTrailRemotionText: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'#e8fbff'}
			/>
			<HtmlInCanvas
				style={container}
				width={1280}
				height={720}
				effects={[
					pattern({
						offsetU: 0,
						rowOffset: interpolate(frame, [2, 36], [0, 67], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.42, 0, 0.58, 1)],
						}),
						offsetV: interpolate(frame, [67, 279], [0, 1.71], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.5217, 0.2168, 0.7399, 0.6284)],
						}),
					}),
				]}
			>
				<Img
					src={staticFile('effects-experiments/pattern-remotion.png')}
					style={{
						position: 'absolute',
						translate: '236.9px -61.1px',
						width: 830,
						height: 852,
						scale: 0.59,
						rotate: '-15deg',
					}}
				/>
			</HtmlInCanvas>
		</>
	);
};
