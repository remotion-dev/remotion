import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {mono} from '../theme';

type Props = {
	readonly index: string;
	readonly title: string;
	readonly color: string;
	readonly start?: number;
};

// Per-chapter label, aligned with the global HUD's bottom baseline.
export const ChapterTag: React.FC<Props> = ({
	index,
	title,
	color,
	start = 12,
}) => {
	const frame = useCurrentFrame();
	const reveal = interpolate(frame, [start, start + 20], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	return (
		<div
			style={{
				position: 'absolute',
				left: 72,
				bottom: 52,
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				fontFamily: mono,
				fontSize: 22,
				fontWeight: 500,
				letterSpacing: '0.18em',
				textTransform: 'uppercase',
				color,
			}}
		>
			<span style={{opacity: reveal}}>{index} / 06</span>
			<span
				style={{
					width: 56,
					height: 2,
					backgroundColor: color,
					scale: `${reveal} 1`,
					transformOrigin: '0% 50%',
				}}
			/>
			<span style={{clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}>
				{title}
			</span>
		</div>
	);
};
