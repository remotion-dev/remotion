import {
	makeMatrix3dTransform,
	reduceMatrices,
	translateZ,
} from '@remotion/svg-3d-engine';
import {useTransformations} from './transformation-context';
import {isBacksideVisible} from './viewing-frontside';

export const FrontFaceG: React.FC<{
	children: React.ReactNode;
	depth: number;
}> = ({children, depth}) => {
	const frontFace = reduceMatrices([translateZ(-depth), useTransformations()]);

	return (
		<g
			style={{
				transform: makeMatrix3dTransform(frontFace),
				transformBox: 'fill-box',
				transformOrigin: 'center center',
				opacity: isBacksideVisible(frontFace) ? 1 : 0,
			}}
		>
			{children}
		</g>
	);
};
