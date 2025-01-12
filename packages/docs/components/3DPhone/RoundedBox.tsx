/* eslint-disable react/no-unknown-property */
import type {Vector3} from '@react-three/fiber';
import type {JSX} from 'react';
import React, {useMemo} from 'react';
import {roundedRect} from './helpers/rounded-rectangle';

type Props = {
	readonly width: number;
	readonly height: number;
	readonly radius: number;
	readonly curveSegments: number;
	readonly depth: number;
	readonly position: Vector3;
} & Omit<JSX.IntrinsicElements['mesh'], 'args' | 'position'>;

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
