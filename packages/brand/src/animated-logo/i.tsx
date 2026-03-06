import {reversePath, translatePath} from '@remotion/paths';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionFixedPath} from './motion-fix';
import {springC} from './springs';
import svg = require('svg-path-properties');
// @ts-expect-error no types
import reverse = require('svg-path-reverse');

const p1 = reversePath(
	translatePath('M1511 335 L1511 508', motionFixedPath, 0)
);

export const I: React.FC<{
	style?: React.CSSProperties;
}> = ({style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		fps,
		frame: frame - springC.delay,
		config: springC.config,
	});

	const sprProgress = interpolate(progress, [0, 0.8], [0, 1], {
		extrapolateRight: 'clamp',
	});
	const iPointProgress = interpolate(progress, [0.8, 1], [0, 1], {
		extrapolateLeft: 'clamp',
	});

	const length1 = svg.svgPathProperties(p1).getTotalLength();
	const strokeDashArray = `${length1}`;
	const strokeDashoffset = length1 - length1 * sprProgress;

	return (
		<g style={style}>
			{iPointProgress > 0 && (
				<circle
					cx={1510.5 + motionFixedPath}
					cy="293.5"
					r="22"
					fill="currentcolor"
					style={{
						transformOrigin: '50% 50%',
						transformBox: 'fill-box',
						transform: `translateY(${interpolate(
							iPointProgress,
							[0, 1],
							[100, 0]
						)}px)`,
					}}
				/>
			)}
			<path
				strokeDasharray={strokeDashArray}
				strokeDashoffset={strokeDashoffset}
				d={p1}
				stroke="currentcolor"
				strokeWidth="46"
			/>
		</g>
	);
};
