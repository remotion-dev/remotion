import {
	makeMatrix3dTransform,
	reduceMatrices,
	scaleY,
	translateZ,
} from '@remotion/svg-3d-engine';
import {useRect} from './path-context';
import {useTransformations} from './transformation-context';

export const Face: React.FC<{
	children: React.ReactNode;
	depth: number;
	type: 'front' | 'back';
}> = ({children, depth, type}) => {
	const frontFace = reduceMatrices([
		type === 'back' ? scaleY(-1) : null,
		translateZ(type === 'front' ? -depth : 0.01 * depth),
		useTransformations(),
	]);
	const {height, width} = useRect();

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
