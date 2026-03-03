import type {ArrowProps} from '@remotion/shapes';
import {Arrow} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const ArrowDemo: React.FC<{
	readonly length: number;
	readonly headWidth: number;
	readonly headLength: number;
	readonly shaftWidth: number;
	readonly darkMode: boolean;
	readonly direction: ArrowProps['direction'];
	readonly cornerRadius: number;
}> = ({
	length,
	headWidth,
	headLength,
	shaftWidth,
	direction,
	cornerRadius,
	darkMode,
}) => {
	const safeShaftWidth = Math.min(shaftWidth, headWidth);
	const safeHeadLength = Math.min(headLength, length);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Arrow
				fill={darkMode ? 'white' : 'var(--ifm-link-color)'}
				length={length}
				headWidth={headWidth}
				headLength={safeHeadLength}
				shaftWidth={safeShaftWidth}
				direction={direction}
				cornerRadius={cornerRadius}
			/>
		</AbsoluteFill>
	);
};
