import {evolvePath, reversePath} from '@remotion/paths';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {springA} from './springs';

import svg = require('svg-path-properties');
// @ts-expect-error no types
import reverse = require('svg-path-reverse');

const d = reversePath(
	'M874 421.5C874 456.696 845.668 485 811 485C776.332 485 748 456.696 748 421.5C748 386.304 776.332 358 811 358C845.668 358 874 386.304 874 421.5Z'
);

const roundMask =
	'M835 437.5 H900.5 L909 320.5 L876.5 315 L709.5 320.5 L700 543 H851 L903 452.5 H835Z';

const middleLine = 421.5;
const middleStrokeWidth = 32;

const d1 = `M897 ${middleLine} L 764 ${middleLine}`;

const horizontalMask = `M897 ${middleLine} L 860 ${
	middleLine - middleStrokeWidth / 2
} L 764 ${middleLine - middleStrokeWidth / 2} L 764 ${
	middleLine + middleStrokeWidth / 2
} L 897 ${middleLine + middleStrokeWidth / 2}`;

export const E: React.FC<{
	style?: React.CSSProperties;
}> = ({style = {}}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const d1Progress = spring({
		fps,
		frame: frame - springA.delay - 1,
		config: springA.config,
	});

	const lineProgress = interpolate(d1Progress, [0.5, 1], [0, 1], {
		extrapolateRight: 'clamp',
		extrapolateLeft: 'clamp',
	});

	const rotateProgress = interpolate(d1Progress, [0, 1], [0, 1], {
		extrapolateRight: 'clamp',
		extrapolateLeft: 'clamp',
	});

	const dash1PathProperties = new svg.svgPathProperties(d1);
	const d1Length = dash1PathProperties.getTotalLength();

	const d1StrokeDashArray = `${d1Length}`;
	const d1StrokeDashoffset = d1Length - d1Length * lineProgress;

	const {strokeDasharray, strokeDashoffset} = evolvePath(rotateProgress, d);

	const rotate = interpolate(rotateProgress, [0, 1], [90, 0]);

	return (
		<>
			{' '}
			<mask
				id="horizontal-mask"
				style={{
					maskType: 'alpha',
				}}
				maskUnits="userSpaceOnUse"
				x="700"
				y="315"
				width="209"
				height="228"
			>
				<path d={horizontalMask} fill="currentcolor" />
			</mask>{' '}
			<mask
				id="mask1_108_2"
				style={{
					maskType: 'alpha',
				}}
				maskUnits="userSpaceOnUse"
				x="700"
				y="315"
				width="209"
				height="228"
			>
				<path d={roundMask} fill="currentcolor" />
			</mask>
			<g
				style={{
					...style,
					transformBox: 'fill-box',
					transformOrigin: 'center center',
					transform: `translateX(0) rotate(${rotate}deg)`,
				}}
			>
				<g mask="url(#horizontal-mask)">
					<path
						d={d1}
						stroke="currentcolor"
						strokeWidth={32}
						strokeDasharray={d1StrokeDashArray}
						strokeDashoffset={d1StrokeDashoffset}
					/>
				</g>

				<g mask="url(#mask1_108_2)">
					<path
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						d={d}
						stroke="currentcolor"
						strokeWidth="46"
						style={{
							transformBox: 'fill-box',
							transformOrigin: 'center center',
							rotate: '21deg',
						}}
					/>
				</g>
			</g>{' '}
		</>
	);
};
