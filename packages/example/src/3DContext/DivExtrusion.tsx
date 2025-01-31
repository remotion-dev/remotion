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
				filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.1))',
			}}
			pointerEvents="none"
		>
			<SvgExtrusion depth={depth} />
		</svg>
	);
};
