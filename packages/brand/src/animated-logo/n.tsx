import {getLength, translatePath} from '@remotion/paths';
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionFixedPath} from './motion-fix';
import {springD} from './springs';

const d = translatePath(
	'M1771 508 V 415 C1771 383.52 1796.52 358 1828 358 V358 C1859.48 358 1885 383.52 1885 415 V508',
	motionFixedPath,
	0
);

export const N: React.FC<{
	readonly style?: React.CSSProperties;
}> = ({style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		fps,
		frame: frame - springD.delay - 5,
		config: springD.config,
	});

	const length = getLength(d);

	const strokeDashArray = `${length}`;
	const strokeDashoffset = length - length * progress;

	return (
		<path
			style={style}
			d={d}
			stroke="currentcolor"
			strokeWidth="46"
			strokeDasharray={strokeDashArray}
			strokeDashoffset={strokeDashoffset}
		/>
	);
};
