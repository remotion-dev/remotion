import {reversePath, translatePath} from '@remotion/paths';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionFixedPath} from './motion-fix';
import {springA} from './springs';
import svg = require('svg-path-properties');
// @ts-expect-error no types
import reverse = require('svg-path-reverse');

export const M: React.FC<{
	style?: React.CSSProperties;
}> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const middle = 485 + 23;
	const path1 = (b: number, m: number) =>
		reversePath(
			translatePath(
				`M949 ${b}V406.455C949 379.142 971.142 357 998.455 357V357C1025.77 357 1047.91 379.142 1047.91 406.455V${m}`,
				motionFixedPath,
				0
			)
		);
	const path2 = (b: number, m: number) =>
		translatePath(
			`M1048.55 ${m}V406.455C1048.55 379.142 1070.69 357 1098 357V357C1125.31 357 1147.45 379.142 1147.45 406.455V${b}`,
			motionFixedPath,
			0
		);

	const prog1 = spring({
		fps,
		frame: frame - springA.delay - 3,
		config: springA.config,
	});

	const leftProg = interpolate(prog1, [0, 0.9], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const rightProg = interpolate(prog1, [0.1, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const bottom = interpolate(leftProg, [0, 1], [700, 485 + 23]);
	const length1 = svg.svgPathProperties(path1(bottom, middle)).getTotalLength();
	const length2 = svg.svgPathProperties(path2(bottom, middle)).getTotalLength();

	const offset1 = interpolate(leftProg, [0, 1], [length1, 0]);
	const offset2 = interpolate(rightProg, [0, 1], [length2, 0]);

	const stroke1Dasharray = `${length1 - offset1} ${offset1}`;

	const stroke2Dasharray = `${length2 - offset2} ${offset2} `;

	return (
		<g style={style}>
			<path
				d={path1(bottom, middle)}
				strokeDasharray={stroke1Dasharray}
				stroke="currentcolor"
				strokeWidth="46"
			/>
			<path
				d={path2(bottom, middle)}
				stroke="currentcolor"
				strokeWidth="46"
				strokeDasharray={stroke2Dasharray}
			/>
		</g>
	);
};
