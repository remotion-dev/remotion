import {slicePath} from '@remotion/paths';
import {makeCircle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const SlicePathDemo: React.FC = () => {
	const {path, height, width} = makeCircle({radius: 100});
	const frame = useCurrentFrame();

	const sliceLine = interpolate(frame, [0, 100], [0.1, 0.75]);

	const sliced = slicePath(path, sliceLine, 0.75);

	return (
		<AbsoluteFill>
			<svg viewBox={`0 0 ${width} ${height}`}>
				<path d={sliced} fill="transparent" stroke="orange" strokeWidth={3} />
				<path
					stroke="red"
					d={`M -100000 ${sliceLine * height} L 100000 ${sliceLine * height}`}
				/>
			</svg>
		</AbsoluteFill>
	);
};
