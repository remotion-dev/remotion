import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionFixedPath} from './motion-fix';
import {springA} from './springs';

export const FirstO: React.FC<{
	readonly style?: React.CSSProperties;
	readonly fill?: boolean;
	readonly innerScale?: number;
}> = ({style, fill, innerScale: _innerScale = 1}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		fps,
		frame: frame - springA.delay + 5,
		config: springA.config,
	});

	const xOffset = interpolate(progress, [0, 1], [1900, 0]);

	const widthExtension = interpolate(progress, [0, 0.5, 1], [0, 300, 0]);

	const width = 126;

	return (
		<g style={style}>
			<rect
				x={1216 + xOffset + motionFixedPath}
				y={359}
				width={width + widthExtension}
				height={width}
				fill={fill ? 'currentColor' : 'none'}
				stroke="currentColor"
				strokeWidth={46}
				rx={63}
			/>
		</g>
	);
};
