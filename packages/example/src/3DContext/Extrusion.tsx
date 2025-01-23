import {parsePath} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {
	extrudeAndTransformElement,
	MatrixTransform4D,
	reduceMatrices,
	translateX,
	translateY,
} from '@remotion/svg-3d-engine';
import {Faces} from '../3DEngine/Faces';

export const SvgExtrusion: React.FC<{
	transformations: MatrixTransform4D[];
	depth: number;
	height: number;
	width: number;
	cornerRadius: number;
}> = ({transformations, cornerRadius, depth, height, width}) => {
	const {path} = makeRect({height, width, cornerRadius});
	const reduced = reduceMatrices(transformations);

	const centerOriented = reduceMatrices([
		translateX(-width / 2),
		translateY(-height / 2),
		reduced,
		translateX(width / 2),
		translateY(height / 2),
	]);

	const extruded = extrudeAndTransformElement({
		backFaceColor: 'black',
		sideColor: 'black',
		crispEdges: false,
		depth,
		points: parsePath(path),
		description: 'rect',
		frontFaceColor: 'white',
		strokeColor: 'black',
		strokeWidth: 3,
		transformations: centerOriented,
	});
	return <Faces elements={[extruded]} />;
};
