import {tint} from '@remotion/effects/tint';
import {Circle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, usePixelDensity} from 'remotion';

const ShapeEffectsTest: React.FC = () => {
	const pixelDensity = usePixelDensity();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: 'white',
				justifyContent: 'center',
			}}
		>
			<Circle
				radius={160}
				fill="#13c26b"
				effects={[tint({color: '#8b5cf6', amount: 0.8})]}
				pixelDensity={pixelDensity}
			/>
		</AbsoluteFill>
	);
};

export default ShapeEffectsTest;
