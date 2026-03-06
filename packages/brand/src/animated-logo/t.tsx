import {translatePath} from '@remotion/paths';
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionFixedPath} from './motion-fix';
import {springB, springC} from './springs';
import svg = require('svg-path-properties');

const d1 = translatePath('M1410 292L1410 509', motionFixedPath, 0);
const d2 = translatePath('M1410 358L1451 358', motionFixedPath, 0);

export const T: React.FC<{
	style?: React.CSSProperties;
}> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		fps,
		frame: frame - springB.delay,
		config: springB.config,
	});
	const progress2 = spring({
		fps,
		frame: frame - springC.delay,
		config: springC.config,
	});

	const length1 = svg.svgPathProperties(d1).getTotalLength();
	const strokeDashArray = `${length1}`;
	const strokeDashoffset = length1 - length1 * progress;

	const length2 = svg.svgPathProperties(d2).getTotalLength();
	const strokeDashArray2 = `${length2}`;
	const strokeDashoffset2 = length2 - length2 * progress2;

	return (
		<g style={style}>
			<path
				d={d1}
				stroke="currentcolor"
				strokeWidth="46"
				strokeDasharray={strokeDashArray}
				strokeDashoffset={strokeDashoffset}
			/>
			<path
				d={d2}
				stroke="currentcolor"
				strokeWidth="46"
				strokeLinecap="round"
				strokeDasharray={strokeDashArray2}
				strokeDashoffset={strokeDashoffset2}
			/>
		</g>
	);
};
