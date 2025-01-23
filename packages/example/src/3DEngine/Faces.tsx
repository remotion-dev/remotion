import {threeDIntoSvgPath} from '@remotion/svg-3d-engine';
import type {FaceType} from '@remotion/svg-3d-engine/src/map-face';
import React from 'react';
import {FaceSVGProps} from './Face';

export const Faces: React.FC<
	{
		readonly elements: FaceType[];
	} & FaceSVGProps
> = ({elements, ...svgProps}) => {
	return (
		<>
			{elements.map(({points, color, crispEdges}, idx) => {
				return (
					// eslint-disable-next-line react/no-array-index-key
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
