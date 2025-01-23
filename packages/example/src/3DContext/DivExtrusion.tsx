import {PathInternals, reduceInstructions} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {MatrixTransform4D} from '@remotion/svg-3d-engine';
import {SvgExtrusion} from './Extrusion';

export const DivExtrusion: React.FC<{
	height: number;
	width: number;
	cornerRadius: number;
	depth: number;
	transformatations: MatrixTransform4D[];
}> = ({height, width, cornerRadius, depth, transformatations}) => {
	const {instructions} = makeRect({height, width, cornerRadius});

	const {viewBox} = PathInternals.getBoundingBoxFromInstructions(
		reduceInstructions(instructions),
	);
	return (
		<svg
			viewBox={viewBox}
			style={{
				overflow: 'visible',
				height,
				width,
				position: 'absolute',
				top: 0,
			}}
			pointerEvents="none"
		>
			<SvgExtrusion
				transformations={transformatations}
				cornerRadius={cornerRadius}
				depth={depth}
				height={height}
				width={width}
			/>
		</svg>
	);
};
