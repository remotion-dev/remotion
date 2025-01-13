import {getBoundingBox} from '@remotion/paths';
import {MatrixTransform4D, transformPath} from '@remotion/svg-3d-engine';
import React, {useMemo} from 'react';

export const Svg: React.FC<{
	readonly svgShape: string;
	readonly transformations: MatrixTransform4D[];
}> = ({svgShape, transformations}) => {
	const boundingBox = useMemo(() => getBoundingBox(svgShape), [svgShape]);

	return (
		<svg
			viewBox={boundingBox.viewBox}
			style={{
				height: boundingBox.height,
				width: boundingBox.width,
				overflow: 'visible',
			}}
		>
			<path
				d={transformPath({path: svgShape, transformations})}
				fill="gray"
				stroke="black"
				strokeWidth="1"
			/>
		</svg>
	);
};
