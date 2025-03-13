import {threeDIntoSvgPath} from '@remotion/svg-3d-engine';
import type {FaceType} from '@remotion/svg-3d-engine/src/map-face';
import React from 'react';

export const Faces: React.FC<{
	readonly elements: FaceType[];
}> = ({elements, ...svgProps}) => {
	return (
		<>
			{elements.map(({points, color, crispEdges}, idx) => {
				return (
					<path
						key={idx}
						d={threeDIntoSvgPath(points)}
						fill={color}
						shapeRendering={crispEdges ? 'crispEdges' : undefined}
						{...svgProps}
					/>
				);
			})}
		</>
	);
};
