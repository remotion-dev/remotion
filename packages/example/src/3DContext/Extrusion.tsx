import {parsePath} from '@remotion/paths';
import {
	extrudeAndTransformElement,
	reduceMatrices,
	translateX,
	translateY,
} from '@remotion/svg-3d-engine';
import {Faces} from '../3DEngine/Faces';
import {useRect} from './path-context';
import {useTransformations} from './transformation-context';

export const SvgExtrusion: React.FC<{
	depth: number;
}> = ({depth}) => {
	const {path, width, height, left, top} = useRect();

	const transformations = useTransformations();

	const centerOriented = reduceMatrices([
		translateX(-left),
		translateY(-top),
		translateX(-width / 2),
		translateY(-height / 2),
		transformations,
		translateX(left),
		translateY(top),
		translateX(width / 2),
		translateY(height / 2),
	]);

	const inbetween = extrudeAndTransformElement({
		sideColor: 'black',
		crispEdges: false,
		depth,
		points: parsePath(path),
		description: 'rect',
		transformations: centerOriented,
	});

	return <Faces elements={inbetween} />;
};
