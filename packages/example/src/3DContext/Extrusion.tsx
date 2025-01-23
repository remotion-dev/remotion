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
import {isBacksideVisible} from './viewing-frontside';

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

	const {inbetween, scaledBackFace} = extrudeAndTransformElement({
		backFaceColor: 'white',
		sideColor: 'black',
		crispEdges: false,
		depth,
		points: parsePath(path),
		description: 'rect',
		transformations: centerOriented,
	});

	const extruded = isBacksideVisible(centerOriented)
		? [...inbetween, scaledBackFace]
		: [scaledBackFace, ...inbetween];

	return <Faces elements={extruded} />;
};
