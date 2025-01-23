import {
	makeMatrix3dTransform,
	MatrixTransform4D,
	reduceMatrices,
	translateZ,
} from '@remotion/svg-3d-engine';

export const FrontFace: React.FC<{
	width: number;
	height: number;
	children: React.ReactNode;
	depth: number;
	transformations: MatrixTransform4D[];
}> = ({width, height, children, depth, transformations: transformatations}) => {
	const reduced = reduceMatrices(transformatations);

	const frontFace = reduceMatrices([translateZ(-depth), reduced]);

	return (
		<div
			style={{
				transform: makeMatrix3dTransform(frontFace),
				display: 'flex',
				width,
				height,
			}}
		>
			{children}
		</div>
	);
};
