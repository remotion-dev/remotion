import {PathInternals, interpolatePath} from '@remotion/paths';
import {makeCircle, makePolygon} from '@remotion/shapes';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const ShapesMorph: React.FC = () => {
	const frame = useCurrentFrame();

	const {path: circlepath} = makeCircle({
		radius: 200,
	});

	const {path: polygonpath} = makePolygon({
		points: 15,
		radius: 80,
	});

	const interpolation = interpolate(frame, [30, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const interpolated = interpolatePath(interpolation, polygonpath, circlepath);
	const debugged = PathInternals.debugPath(interpolated);

	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			<svg viewBox="0 0 720 720">
				<path d={interpolated} />
				{debugged.map((debug) => {
					return <path d={debug.d} fill={debug.color} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};
