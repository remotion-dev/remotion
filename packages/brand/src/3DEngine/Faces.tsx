import {threeDIntoSvgPath} from '@remotion/svg-3d-engine';
import type {FaceType} from '@remotion/svg-3d-engine';
import React from 'react';

export const Faces: React.FC<{
	readonly elements: FaceType[];
}> = ({elements, ...svgProps}) => {
	const usedKeys = new Map<string, number>();

	return (
		<>
			{elements.map(({points, color, crispEdges}) => {
				const path = threeDIntoSvgPath(points);
				const keyBase = `${path}-${color}`;
				const occurrence = usedKeys.get(keyBase) ?? 0;
				usedKeys.set(keyBase, occurrence + 1);

				return (
					<path
						key={`${keyBase}-${occurrence}`}
						d={path}
						fill={color}
						shapeRendering={crispEdges ? 'crispEdges' : undefined}
						{...svgProps}
					/>
				);
			})}
		</>
	);
};
