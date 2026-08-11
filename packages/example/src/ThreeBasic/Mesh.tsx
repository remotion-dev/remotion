import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
export const Mesh: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<mesh
			position={[0, 0, 0]}
			rotation={[frame * 0.06 * 0.5, frame * 0.07 * 0.5, frame * 0.08 * 0.5]}
			scale={interpolate(Math.sin(frame / 10), [-1, 1], [0.8, 1.2])}
		>
			<boxGeometry args={[100, 100, 100]} />
			<meshStandardMaterial
				color={[
					Math.sin(frame * 0.12) * 0.5 + 0.5,
					Math.cos(frame * 0.11) * 0.5 + 0.5,
					Math.sin(frame * 0.08) * 0.5 + 0.5,
				]}
			/>
		</mesh>
	);
};
