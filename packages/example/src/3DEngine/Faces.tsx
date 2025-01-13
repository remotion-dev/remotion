import type {ThreeDElement} from '@remotion/svg-3d-engine/src/elements';
import type {FaceType} from '@remotion/svg-3d-engine/src/map-face';
import React from 'react';
import {Face, FaceSVGProps} from './Face';

const sortFacesZIndex = (face: FaceType[]): FaceType[] => {
	return face.slice().sort((a, b) => {
		return b.centerPoint[2] - a.centerPoint[2];
	});
};

export const Faces: React.FC<
	{
		readonly elements: ThreeDElement[];
		readonly noSort?: boolean;
	} & FaceSVGProps
> = ({elements, noSort, ...svgProps}) => {
	const sortedElement = noSort
		? elements
		: elements.sort((a, b) => {
				return b.centerPoint[2] - a.centerPoint[2];
			});

	return (
		<>
			{sortedElement.map((element, i) => {
				const sortedFaces = sortFacesZIndex(element.faces);

				return (
					// eslint-disable-next-line react/no-array-index-key
					<React.Fragment key={i}>
						{sortedFaces.map(
							({points, color, strokeWidth, strokeColor, crispEdges}, idx) => {
								return (
									<Face
										// eslint-disable-next-line react/no-array-index-key
										key={JSON.stringify(points) + idx}
										strokeColor={strokeColor}
										color={color}
										points={points}
										strokeWidth={strokeWidth}
										crispEdges={crispEdges}
										{...svgProps}
									/>
								);
							},
						)}
					</React.Fragment>
				);
			})}
		</>
	);
};
