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
	return (
		<RectProvider height={height} width={width} cornerRadius={cornerRadius}>
			<div style={{width, height, position: 'relative'}}>
				<DivExtrusion depth={depth} />
				<FrontFace depth={depth}>{children}</FrontFace>
			</div>
		</RectProvider>
	);
};
