import React, {useId} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ChapterTag} from '../components/ChapterTag';
import {RiseText} from '../components/RiseText';
import {colors, mono, sans, serif} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const GRID = 12;
const PITCH = (32 * Math.PI) / 180;
const CENTER = {x: 1250, y: 596};
const MIN_H = 0.5;
const MAX_H = 3.1;

type Rgb = readonly [number, number, number];

const hexToRgb = (hex: string): Rgb => [
	parseInt(hex.slice(1, 3), 16),
	parseInt(hex.slice(3, 5), 16),
	parseInt(hex.slice(5, 7), 16),
];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
	a[0] + (b[0] - a[0]) * t,
	a[1] + (b[1] - a[1]) * t,
	a[2] + (b[2] - a[2]) * t,
];

const toCss = (c: Rgb) =>
	`rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`;

const CLAY = hexToRgb('#DDD5C6');
const ACCENT = hexToRgb(colors.accent);
const INK = hexToRgb(colors.ink);

// Fixed world-space light: faces keep their shade while the camera orbits.
const SHADE = {top: 1, front: 0.8, side: 0.6};

const Cubes: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const shadowId = `shadow-${useId().replace(/:/g, '')}`;
	const t = frame / fps;

	const yaw = interpolate(frame, [0, 210], [24, 62], clamp) * (Math.PI / 180);
	const scale = interpolate(frame, [0, 210], [56, 63], clamp);
	const cosY = Math.cos(yaw);
	const sinY = Math.sin(yaw);
	const cosP = Math.cos(PITCH);
	const sinP = Math.sin(PITCH);

	const project = (x: number, y: number, z: number) => {
		const cx = x * cosY - z * sinY;
		const cz = x * sinY + z * cosY;
		return {
			x: CENTER.x + cx * scale,
			y: CENTER.y + (cz * sinP - y * cosP) * scale,
		};
	};
	const poly = (points: [number, number, number][]) =>
		points
			.map(([x, y, z]) => {
				const p = project(x, y, z);
				return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
			})
			.join(' ');

	const half = GRID / 2;
	const cubes = [];
	for (let i = 0; i < GRID; i++) {
		for (let j = 0; j < GRID; j++) {
			const x0 = i - half;
			const z0 = j - half;
			const cx = x0 + 0.5;
			const cz = z0 + 0.5;
			const distance = Math.hypot(cx, cz);
			const rise = interpolate(
				frame,
				[2 + distance * 2.6, 30 + distance * 2.6],
				[0, 1],
				{
					...clamp,
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				},
			);
			// One wave per bar, phased so the center crests on each downbeat.
			const wave =
				0.5 + 0.5 * Math.sin(Math.PI * 2 * 0.5 * t - distance * 0.78 + 0.55);
			const height = Math.max(0.02, (MIN_H + (MAX_H - MIN_H) * wave) * rise);
			const heat = interpolate(wave, [0.55, 1], [0, 1], clamp) ** 1.6;
			const base = mix(CLAY, ACCENT, heat * rise);
			cubes.push({
				key: `${i}-${j}`,
				depth: cx * sinY + cz * cosY,
				x0,
				z0,
				height,
				base,
			});
		}
	}
	cubes.sort((a, b) => a.depth - b.depth);

	return (
		<svg
			width={1920}
			height={1080}
			viewBox="0 0 1920 1080"
			style={{position: 'absolute', left: 0, top: 0}}
		>
			<defs>
				<filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation={22} />
				</filter>
			</defs>
			<polygon
				points={poly([
					[-half, 0, -half],
					[half, 0, -half],
					[half, 0, half + 0.6],
					[-half, 0, half + 0.6],
				])}
				fill={colors.ink}
				opacity={0.16 * interpolate(frame, [0, 30], [0, 1], clamp)}
				filter={`url(#${shadowId})`}
				transform="translate(10 26)"
			/>
			{cubes.map(({key, x0, z0, height, base}) => {
				const x1 = x0 + 1;
				const z1 = z0 + 1;
				const top = toCss(mix(INK, base, SHADE.top));
				const front = toCss(mix(INK, base, SHADE.front));
				const side = toCss(mix(INK, base, SHADE.side));
				const edge = toCss(mix(INK, base, 0.5));
				return (
					<g key={key} strokeWidth={1.1} strokeLinejoin="round" stroke={edge}>
						<polygon
							points={poly([
								[x0, 0, z1],
								[x1, 0, z1],
								[x1, height, z1],
								[x0, height, z1],
							])}
							fill={front}
						/>
						<polygon
							points={poly([
								[x1, 0, z0],
								[x1, 0, z1],
								[x1, height, z1],
								[x1, height, z0],
							])}
							fill={side}
						/>
						<polygon
							points={poly([
								[x0, height, z0],
								[x1, height, z0],
								[x1, height, z1],
								[x0, height, z1],
							])}
							fill={top}
						/>
					</g>
				);
			})}
		</svg>
	);
};

const Spec: React.FC<{
	readonly label: string;
	readonly value: string;
	readonly start: number;
}> = ({label, value, start}) => {
	const frame = useCurrentFrame();
	const enter = interpolate(frame, [start, start + 16], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	return (
		<div
			style={{
				display: 'flex',
				width: 470,
				justifyContent: 'space-between',
				fontFamily: mono,
				fontSize: 26,
				letterSpacing: '0.1em',
				color: colors.ink,
				opacity: enter,
				translate: `${(1 - enter) * -24}px 0`,
				borderBottom: '1px solid rgba(11, 11, 15, 0.16)',
				paddingBottom: 12,
			}}
		>
			<span style={{opacity: 0.5}}>{label}</span>
			<span style={{fontVariantNumeric: 'tabular-nums'}}>{value}</span>
		</div>
	);
};

export const CubeWave: React.FC = () => {
	const frame = useCurrentFrame();
	const yawDegrees = interpolate(frame, [0, 210], [24, 62], clamp);

	return (
		<AbsoluteFill style={{backgroundColor: '#F3EFE6'}}>
			<Cubes />
			<div
				style={{
					position: 'absolute',
					left: 140,
					top: 190,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
				}}
			>
				<RiseText
					text="Depth &"
					start={18}
					stagger={2}
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 112,
						lineHeight: 0.84,
						letterSpacing: '-0.045em',
						color: colors.ink,
						paddingTop: 8,
					}}
				/>
				<RiseText
					text="dimension."
					start={24}
					stagger={2}
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 132,
						lineHeight: 0.9,
						color: colors.accent,
						paddingRight: 18,
					}}
				/>
				<Interactive.Div
					name="Caption"
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 44,
						lineHeight: 1.2,
						color: '#0B0B0F',
						marginTop: 34,
						marginBottom: 56,
						width: 500,
						opacity: interpolate(frame, [34, 50], [0, 0.75], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					A tiny 3D engine: projection, depth sort, light.
				</Interactive.Div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
					<Spec label="CUBES" value={`${GRID} × ${GRID}`} start={40} />
					<Spec
						label="CAMERA"
						value={`θ ${yawDegrees.toFixed(1)}°`}
						start={45}
					/>
					<Spec label="WAVE" value="0.5 Hz · 1 bar" start={50} />
				</div>
			</div>
			<ChapterTag index="06" title="Dimension" color={colors.ink} start={20} />
		</AbsoluteFill>
	);
};
