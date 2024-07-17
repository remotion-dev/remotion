import {PathInternals, getLength} from '@remotion/paths';
import {makeStar} from '@remotion/shapes';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

export const SlicePath: React.FC = () => {
	const frame = useCurrentFrame();

	const path = makeStar({
		points: 10,
		innerRadius: 100,
		outerRadius: 200,
		edgeRoundness: 0.5,
	});

	const progress = interpolate(frame, [0, 100], [0, 1]);
	const length = getLength(path.path);

	const cut = PathInternals.cutPath(path.path, length * progress);

	return (
		<svg viewBox={`0 0 ${path.width} ${path.height}`}>
			<path d={cut} stroke="black" strokeWidth={3} fill="none" />
		</svg>
	);
};
