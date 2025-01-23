import {useRef} from 'react';
import {DivExtrusion} from './DivExtrusion';
import {FrontFace} from './FrontFace';
import {RectProvider} from './path-context';

export const Div3D: React.FC<{
	children: React.ReactNode;
	width: number;
	height: number;
	depth: number;
	cornerRadius: number;
}> = ({children, width, height, depth, cornerRadius}) => {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<RectProvider height={height} width={width} cornerRadius={cornerRadius}>
			<div
				ref={ref}
				className="relative"
				style={{width, height, position: 'relative'}}
			>
				<DivExtrusion depth={depth} />
				<FrontFace depth={depth}>{children}</FrontFace>
			</div>
		</RectProvider>
	);
};
