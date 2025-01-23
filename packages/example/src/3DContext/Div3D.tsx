import {DivExtrusion} from './DivExtrusion';
import {Face} from './FrontFace';
import {RectProvider} from './path-context';
import {useTransformations} from './transformation-context';
import {isBacksideVisible} from './viewing-frontside';

export const Div3D: React.FC<{
	children: React.ReactNode;
	width: number;
	height: number;
	depth: number;
	cornerRadius: number;
	backFace?: React.ReactNode;
}> = ({children, width, height, depth, cornerRadius, backFace}) => {
	const frontFace = isBacksideVisible(useTransformations());

	return (
		<RectProvider height={height} width={width} cornerRadius={cornerRadius}>
			<div
				style={{
					width,
					height,
					position: 'relative',
				}}
			>
				<DivExtrusion depth={depth} />
				{frontFace ? (
					<Face type="front" depth={depth}>
						{children}
					</Face>
				) : (
					<Face type="back" depth={depth}>
						{backFace}
					</Face>
				)}
			</div>
		</RectProvider>
	);
};
