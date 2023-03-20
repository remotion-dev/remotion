import {slicePath} from '@remotion/paths';
import {makeCircle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const SlicePathDemo: React.FC = () => {
	const {path, height, width} = makeCircle({radius: 100});
	const frame = useCurrentFrame();

	const sliced = slicePath(
		path,
		interpolate(frame, [0, 100], [0.1, 0.75]),
		0.75
	);

	return (
		<AbsoluteFill>
			<svg viewBox={`0 0 ${width} ${height}`}>
				<path d={sliced} stroke="orange" strokeWidth={3} />
			</svg>
		</AbsoluteFill>
	);
};
