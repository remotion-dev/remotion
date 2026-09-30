import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	random,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {easeOut} from '../anim';

// Radial speed streaks around a focus point.
export const SpeedLines: React.FC<{
	readonly color?: string;
	readonly cx?: number;
	readonly cy?: number;
}> = ({color = 'rgba(255,255,255,0.85)', cx = 1000, cy = 430}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const fade = interpolate(
		frame,
		[0, 4, durationInFrames - 8, durationInFrames],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<svg width={1920} height={1080}>
				{new Array(46).fill(true).map((_, i) => {
					const angle = random(`angle-${i}`) * Math.PI * 2;
					const speed = 0.6 + random(`speed-${i}`) * 0.8;
					const travel =
						((frame * 38 * speed + random(`offset-${i}`) * 900) % 900) + 380;
					const length = 120 + random(`len-${i}`) * 260;
					const x1 = cx + Math.cos(angle) * travel;
					const y1 = cy + Math.sin(angle) * travel;
					const x2 = cx + Math.cos(angle) * (travel + length);
					const y2 = cy + Math.sin(angle) * (travel + length);
					return (
						<line
							key={i}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke={color}
							strokeWidth={3 + random(`w-${i}`) * 6}
							strokeLinecap="round"
							opacity={0.35 + random(`o-${i}`) * 0.5}
						/>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

// Cinematic bars that slide in from top and bottom.
export const Letterbox: React.FC<{readonly height?: number}> = ({
	height = 104,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = interpolate(
		frame,
		[0, 18, durationInFrames - 18, durationInFrames],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: easeOut,
		},
	);
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 0,
					height: height * p,
					backgroundColor: '#000',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: height * p,
					backgroundColor: '#000',
				}}
			/>
		</AbsoluteFill>
	);
};

// A one-shot burst of confetti dots from a point.
export const Burst: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly colors: readonly string[];
	readonly count?: number;
}> = ({x, y, colors, count = 28}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			{new Array(count).fill(true).map((_, i) => {
				const angle = random(`b-a-${i}`) * Math.PI * 2;
				const distance = 140 + random(`b-d-${i}`) * 260;
				const t = interpolate(frame, [0, 26], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: easeOut,
				});
				const fall = Math.max(0, frame - 10) * 2.2;
				const size = 12 + random(`b-s-${i}`) * 16;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x + Math.cos(angle) * distance * t - size / 2,
							top: y + Math.sin(angle) * distance * t + fall - size / 2,
							width: size,
							height: size * (random(`b-r-${i}`) > 0.5 ? 1 : 0.45),
							borderRadius: random(`b-c-${i}`) > 0.5 ? size : 3,
							backgroundColor: colors[i % colors.length],
							rotate: `${frame * 12 * (random(`b-rot-${i}`) - 0.5)}deg`,
							opacity: interpolate(frame, [22, 40], [1, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

// Decorative waveform bars, deterministic per seed.
export const WaveBars: React.FC<{
	readonly seed: string;
	readonly bars?: number;
	readonly height?: number;
	readonly color: string;
	readonly level?: number;
	readonly live?: boolean;
}> = ({seed, bars = 24, height = 60, color, level = 1, live = false}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 4,
				height,
			}}
		>
			{new Array(bars).fill(true).map((_, i) => {
				const envelope = Math.sin((i / (bars - 1)) * Math.PI) * 0.7 + 0.3;
				const jitter = live
					? 0.55 +
						0.45 * Math.sin(frame / 3 + i * 1.7 + random(`${seed}-${i}`) * 6)
					: 0.35 + random(`${seed}-${i}`) * 0.65;
				return (
					<div
						key={i}
						style={{
							width: 6,
							borderRadius: 3,
							height: Math.max(6, height * envelope * jitter * level),
							backgroundColor: color,
						}}
					/>
				);
			})}
		</div>
	);
};
