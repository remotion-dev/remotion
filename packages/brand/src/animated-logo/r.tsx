import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {springA} from './springs';
import svg = require('svg-path-properties');

const d = `M630 508
V415
C630 383.52 655.52 358 687 358
h 16`;

export const R: React.FC<{
	style?: React.CSSProperties;
}> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const progress = spring({
		fps,
		frame: frame - springA.delay,
		config: springA.config,
	});

	const length = svg.svgPathProperties(d).getTotalLength();

	const strokeDashArray = `${length}`;
	const strokeDashoffset = length - length * progress;

	return (
		<path
			style={style}
			d={d}
			strokeDasharray={strokeDashArray}
			strokeDashoffset={strokeDashoffset}
			stroke="currentColor"
			strokeWidth="46"
		/>
	);
};
