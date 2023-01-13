import {Triangle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const TriangleTest: React.FC = () => {
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
				style={{
					margin: '10px',
				}}
				width={100}
				height={100}
				fill="red"
				direction="left"
				color="green"
			/>

			<Triangle
				style={{
					margin: '10px',
				}}
				width={100}
				height={100}
				fill="red"
				direction="right"
				color="green"
			/>
			<Triangle
				style={{
					margin: '10px',
				}}
				width={100}
				height={100}
				fill="red"
				direction="top"
				color="green"
			/>
			<Triangle
				style={{
					margin: '10px',
				}}
				width={100}
				height={100}
				fill="red"
				direction="bottom"
				color="green"
			/>
		</AbsoluteFill>
	);
};

export default TriangleTest;
