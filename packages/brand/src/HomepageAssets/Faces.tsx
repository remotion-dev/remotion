import React from 'react';
import {ThreeDElement} from './element';
import {Face, FaceSVGProps} from './Face';
import {FaceType} from './map-face';

const sortFacesZIndex = (face: FaceType[]): FaceType[] => {
	return face.slice().sort((a, b) => {
		return b.centerPoint[2] - a.centerPoint[2];
	});
};

export const Faces: React.FC<
	{
		elements: ThreeDElement[];
		noSort?: boolean;
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
					<React.Fragment key={i}>
						{sortedFaces.map(
							({points, color, strokeWidth, strokeColor, crispEdges}, i) => {
								return (
									<Face
										key={JSON.stringify(points) + i}
										strokeColor={strokeColor}
										color={color}
										points={points}
										strokeWidth={strokeWidth}
										crispEdges={crispEdges}
										{...svgProps}
									/>
								);
							}
						)}
					</React.Fragment>
				);
			})}
		</>
	);
};
