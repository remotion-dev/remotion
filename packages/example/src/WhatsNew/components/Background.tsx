import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../theme';

// Soft brand backdrop that is visible whenever the talking head is not full
// frame. Two slow color fields drift over a dot grid.
export const Backdrop: React.FC<{
	readonly accent: string;
	readonly dark?: boolean;
}> = ({accent, dark = false}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: dark ? '#06080E' : colors.mist,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: -260 + 90 * Math.sin(t * 0.21),
					top: -300 + 70 * Math.cos(t * 0.17),
					width: 1300,
					height: 1300,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${accent}${dark ? '55' : '3a'} 0%, ${accent}00 62%)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 700 + 110 * Math.cos(t * 0.13),
					top: 260 + 80 * Math.sin(t * 0.19),
					width: 1500,
					height: 1500,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${colors.blue}${dark ? '40' : '2e'} 0%, ${colors.blue}00 60%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `radial-gradient(${dark ? 'rgba(255,255,255,0.10)' : 'rgba(11,15,25,0.10)'} 1.7px, transparent 1.8px)`,
					backgroundSize: '38px 38px',
					backgroundPosition: `${(frame * 0.35) % 38}px ${(frame * 0.2) % 38}px`,
				}}
			/>
		</AbsoluteFill>
	);
};
