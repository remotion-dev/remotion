import {Triangle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const TriangleTest: React.FC = () => {
	const frame = useCurrentFrame();
	const rotation = interpolate(frame, [0, 100], [0, 360]);

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
			}}
		>
			<Triangle
				pathStyle={{
					transform: `rotate(${rotation}deg)`,
				}}
				length={100}
				stroke="red"
				direction="left"
			/>

			<Triangle
				pathStyle={{
					transform: `rotate(${rotation}deg)`,
				}}
				length={100}
				fill="red"
				direction="right"
			/>
			<Triangle
				pathStyle={{
					transform: `rotate(${rotation}deg)`,
				}}
				length={100}
				fill="red"
				direction="top"
			/>
			<Triangle
				pathStyle={{
					transform: `rotate(${rotation}deg)`,
				}}
				length={100}
				fill="red"
				direction="bottom"
			/>
		</AbsoluteFill>
	);
};

export default TriangleTest;
