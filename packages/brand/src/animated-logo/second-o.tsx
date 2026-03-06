import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {motionFixedPath} from './motion-fix';
import {springB} from './springs';

export const SecondO: React.FC<{
	style?: React.CSSProperties;
}> = ({style}) => {
	const innerSpr = 1;

	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const toMove = 600;
	const right = interpolate(innerSpr, [0, 1], [toMove, 0]);

	const progress = spring({
		fps,
		frame: frame - springB.delay,
		config: springB.config,
	});

	const xOffset = interpolate(progress, [0, 1], [550, 0]);

	const widthExtension = interpolate(progress, [0, 0.5, 1], [0, 300, 0]);

	return (
		<g style={style}>
			<g
				style={{
					transformBox: 'fill-box',
					transformOrigin: 'center center',
					transform: `translateX(${right}px)`,
				}}
			>
				<rect
					x={1642.5 - 126 / 2 + xOffset + motionFixedPath}
					y={421.5 - 126 / 2}
					width={126 + widthExtension}
					height={126}
					stroke="currentcolor"
					strokeWidth={46}
					rx={63}
				/>
			</g>
		</g>
	);
};
