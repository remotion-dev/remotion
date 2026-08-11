import {Circle, Rect} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const RectTest: React.FC = () => {
	const frame = useCurrentFrame();

	const edgeRoundness = interpolate(frame, [0, 100], [0, 1], {
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
					alignItems: 'center',
				}}
			>
				<Rect
					debug
					fill="rgba(0, 255, 0, 0.5)"
					edgeRoundness={edgeRoundness}
					width={450}
					height={450}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
					alignItems: 'center',
				}}
			>
				<Circle fill="rgba(255, 0, 0, 0.1)" radius={225} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
					alignItems: 'center',
					fontSize: 40,
					fontFamily: 'sans-serif',
				}}
			>
				{edgeRoundness.toFixed(3)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default RectTest;
