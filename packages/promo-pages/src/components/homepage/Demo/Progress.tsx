import {makeCircle, makePie} from '@remotion/shapes';
import React from 'react';
import {PALETTE} from '../layout/colors';

export const Progress: React.FC<{
	readonly progress: number;
}> = ({progress}) => {
	const inner = makeCircle({
		radius: 10,
	});

	const outer = makePie({
		progress,
		closePath: false,
		radius: 10,
	});

	return (
		<svg
			viewBox={`0 0 ${inner.width} ${inner.height}`}
			style={{overflow: 'visible', height: 22}}
		>
			<path
				d={inner.path}
				stroke={PALETTE.BORDER_COLOR}
				strokeWidth={4}
				fill="transparent"
			/>
			<path
				d={outer.path}
				stroke={PALETTE.BRAND}
				strokeWidth={4}
				fill="transparent"
				strokeLinecap="round"
			/>
		</svg>
	);
};
