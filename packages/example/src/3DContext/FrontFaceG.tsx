import {
	makeMatrix3dTransform,
	reduceMatrices,
	scaleY,
	translateZ,
} from '@remotion/svg-3d-engine';
import {useTransformations} from './transformation-context';

export const FrontFaceG: React.FC<{
	children: React.ReactNode;
	depth: number;
	type: 'front' | 'back';
}> = ({children, depth, type}) => {
	const frontFace = reduceMatrices([
		type === 'back' ? scaleY(-1) : null,
		translateZ(type === 'front' ? -depth : 0.01 * depth),
		useTransformations(),
	]);

	return (
		<g
			style={{
				transform: makeMatrix3dTransform(frontFace),
				transformBox: 'fill-box',
				transformOrigin: 'center center',
			}}
		>
			{children}
		</g>
	);
};
