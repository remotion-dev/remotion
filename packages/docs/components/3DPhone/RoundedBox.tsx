import React, {useMemo} from 'react';
import {roundedRect} from './helpers/rounded-rectangle';

type Props = {
	width: number;
	height: number;
	radius: number;
	curveSegments: number;
	depth: number;
} & Omit<JSX.IntrinsicElements['mesh'], 'args'>;

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
		[height, radius, width]
	);

	const params = useMemo(
		() => ({
			depth,
			bevelEnabled: true,
			bevelSize: 0,
			bevelThickness: 0,
			curveSegments,
		}),
		[curveSegments, depth]
	);

	return (
		<mesh {...otherProps}>
			<extrudeBufferGeometry attach="geometry" args={[shape, params]} />
			{children}
		</mesh>
	);
};
