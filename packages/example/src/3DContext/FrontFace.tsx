import {
	makeMatrix3dTransform,
	reduceMatrices,
	scaleX,
	translateZ,
} from '@remotion/svg-3d-engine';
import {useRect} from './path-context';
import {useTransformations} from './transformation-context';

export const Face: React.FC<{
	children: React.ReactNode;
	depth: number;
	type: 'front' | 'back';
}> = ({children, depth, type}) => {
	const {width, height} = useRect();

	const frontFace = reduceMatrices([
		type === 'back' ? scaleX(-1) : null,
		translateZ(type === 'front' ? -depth * 0.49 : 0.49 * depth),
		useTransformations(),
	]);

	return (
		<div
			style={{
				transform: makeMatrix3dTransform(frontFace),
				display: 'flex',
				width,
				height,
				position: 'absolute',
			}}
		>
			{children}
		</div>
	);
};
