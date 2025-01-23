import React from 'react';
import {useCurrentFrame} from 'remotion';
import {RotateX, RotateY} from '../3DContext/transformation-context';

export const SpinEffect: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const frame = useCurrentFrame();

	const x = frame / 10;
	const y = 0;

	return (
		<RotateX radians={x}>
			<RotateY radians={y}>{children}</RotateY>
		</RotateX>
	);
};
