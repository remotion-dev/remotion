import React, {useMemo} from 'react';
import {roundedRect} from './helpers/rounded-rectangle';

type Props = {
	readonly width: number;
	readonly height: number;
	readonly radius: number;
	readonly curveSegments: number;
	readonly depth: number;
} & Omit<JSX.IntrinsicElements['positionMesh'], 'args'>;

export const RoundedBox: React.FC<Props> = ({
	width,
	height,
	radius,
	curveSegments,
	children,
	depth,
	...otherProps
}) => {
	const shape = useMemo(
		() => roundedRect({width, height, radius}),
		[height, radius, width],
	);

	const params = useMemo(
		() => ({
			depth,
			bevelEnabled: true,
			bevelSize: 0,
			bevelThickness: 0,
			curveSegments,
		}),
		[curveSegments, depth],
	);

	return (
		<mesh {...otherProps}>
			<extrudeGeometry attach="geometry" args={[shape, params]} />
			{children}
		</mesh>
	);
};
