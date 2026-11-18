import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	const points =
		'10% 10%, 90% 10%, 90% 90%, 10% 90%, 10% 10%, 30% 30%, 70% 30%, 70% 70%, 30% 70%, 30% 30%';

	return (
		<AbsoluteFill style={{backgroundColor: 'white', flexDirection: 'row'}}>
			{(['evenodd', 'nonzero', null] as const).map((fillRule) => (
				<div
					key={fillRule ?? 'default'}
					style={{
						width: 200,
						height: 200,
						backgroundColor: 'red',
						clipPath: `polygon(${fillRule ? `${fillRule}, ` : ''}${points})`,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const clipPathPolygonFillRules = {
	component: Component,
	id: 'clip-path-polygon-fill-rules',
	width: 600,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
