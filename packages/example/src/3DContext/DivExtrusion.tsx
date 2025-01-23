import {SvgExtrusion} from './Extrusion';
import {useRect} from './path-context';

export const DivExtrusion: React.FC<{
	depth: number;
}> = ({depth}) => {
	const {viewBox, height, width} = useRect();

	return (
		<svg
			viewBox={viewBox}
			style={{
				overflow: 'visible',
				height,
				width,
				position: 'absolute',
				top: 0,
			}}
			pointerEvents="none"
		>
			<SvgExtrusion depth={depth} />
		</svg>
	);
};
