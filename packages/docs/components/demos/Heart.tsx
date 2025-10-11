import {Heart} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const HeartDemo: React.FC<{
	readonly darkMode: boolean;
	readonly aspectRatio: number;
	readonly height: number;
	readonly bottomRoundnessAdjustment: number;
	readonly depthAdjustment: number;
	readonly debug: boolean;
	readonly showStrokeInsteadPlaygroundOnly: boolean;
}> = ({
	aspectRatio,
	height,
	darkMode,
	bottomRoundnessAdjustment,
	depthAdjustment,
	debug,
	showStrokeInsteadPlaygroundOnly,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Heart
				fill={
					showStrokeInsteadPlaygroundOnly
						? 'transparent'
						: darkMode
							? 'white'
							: 'var(--ifm-link-color)'
				}
				aspectRatio={aspectRatio}
				height={height}
				bottomRoundnessAdjustment={bottomRoundnessAdjustment}
				depthAdjustment={depthAdjustment}
				debug={debug}
				stroke={
					showStrokeInsteadPlaygroundOnly
						? darkMode
							? 'white'
							: 'var(--ifm-link-color)'
						: 'transparent'
				}
				strokeWidth={height / 20}
				strokeMiterlimit={1000000}
			/>
		</AbsoluteFill>
	);
};
