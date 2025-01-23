import {
	makeMatrix3dTransform,
	reduceMatrices,
	translateZ,
} from '@remotion/svg-3d-engine';
import {useRect} from './path-context';
import {useTransformations} from './transformation-context';

export const FrontFace: React.FC<{
	children: React.ReactNode;
	depth: number;
}> = ({children, depth}) => {
	const frontFace = reduceMatrices([translateZ(-depth), useTransformations()]);
	const {height, width} = useRect();

	return (
		<div
			style={{
				transform: makeMatrix3dTransform(frontFace),
				display: 'flex',
				width,
				height,
				backfaceVisibility: 'hidden',
			}}
		>
			{children}
		</div>
	);
};
