import {MatrixTransform4D} from '@remotion/svg-3d-engine';
import {useRef} from 'react';
import {DivExtrusion} from './DivExtrusion';
import {FrontFace} from './FrontFace';

export const Div3D: React.FC<{
	children: React.ReactNode;
	width: number;
	height: number;
	depth: number;
	transformatations: MatrixTransform4D[];
	cornerRadius: 10;
}> = ({children, width, height, depth, transformatations, cornerRadius}) => {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={ref}
			className="relative"
			style={{width, height, position: 'relative'}}
		>
			<DivExtrusion
				transformatations={transformatations}
				cornerRadius={cornerRadius}
				depth={depth}
				height={height}
				width={width}
			/>
			<FrontFace
				height={height}
				width={width}
				depth={depth}
				transformations={transformatations}
			>
				{children}
			</FrontFace>
		</div>
	);
};
