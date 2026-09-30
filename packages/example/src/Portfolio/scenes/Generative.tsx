import {noise3D} from '@remotion/noise';
import React from 'react';
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

const LINES = 40;
const POINTS = 120;
const FIELD = {left: 800, width: 980, top: 330, spacing: 15.5};
const HIGHLIGHT = 23;

const ridgeHeight = (line: number, u: number, t: number) => {
	const envelope = Math.exp(-((u - 0.5) ** 2) / (2 * 0.15 ** 2));
	const broad = noise3D('ridge', u * 3.4, line * 0.21, t * 0.32) * 0.5 + 0.5;
	const detail =
		noise3D('ridge-detail', u * 14, line * 0.6, t * 0.9) * 0.5 + 0.5;
	return envelope * (broad ** 2.2 * 190 + detail * 16) + detail * 3;
};

const RidgeField: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	const paths = new Array(LINES).fill(true).map((_, line) => {
		const grow = interpolate(frame, [line * 1.1, line * 1.1 + 28], [0, 1], {
			...clamp,
			easing: Easing.bezier(0.16, 1, 0.3, 1),
		});
		const baseY = FIELD.top + line * FIELD.spacing;
		let d = '';
		let peak = {x: 0, y: baseY};
		for (let j = 0; j < POINTS; j++) {
			const u = j / (POINTS - 1);
			const x = FIELD.left + u * FIELD.width;
			const y = baseY - ridgeHeight(line, u, t) * grow;
			d += `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
			if (y < peak.y) {
				peak = {x, y};
			}
		}
		d += `L ${FIELD.left + FIELD.width} ${baseY} L ${FIELD.left} ${baseY} Z`;
		return {d, grow, peak};
	});
	const highlight = paths[HIGHLIGHT];

	return (
		<svg
			width={1920}
			height={1080}
			viewBox="0 0 1920 1080"
			style={{position: 'absolute', left: 0, top: 0}}
		>
			{paths.map(({d, grow}, line) => (
				<path
					key={line}
					d={d}
					fill={colors.ink}
					stroke={line === HIGHLIGHT ? colors.accent : colors.paper}
					strokeWidth={line === HIGHLIGHT ? 3.5 : 2}
					strokeLinejoin="round"
					opacity={interpolate(grow, [0, 0.15], [0, 1], clamp)}
				/>
			))}
			<g opacity={interpolate(frame, [60, 72], [0, 1], clamp)}>
				<line
					x1={highlight.peak.x}
					x2={highlight.peak.x}
					y1={highlight.peak.y - 18}
					y2={highlight.peak.y - 68}
					stroke={colors.accent}
					strokeWidth={2}
				/>
				<circle
					cx={highlight.peak.x}
					cy={highlight.peak.y}
					r={9}
					fill={colors.ink}
					stroke={colors.accent}
					strokeWidth={3.5}
				/>
				<rect
					x={highlight.peak.x + 4}
					y={highlight.peak.y - 106}
					width={150}
					height={38}
					rx={4}
					fill={colors.ink}
					stroke={colors.accent}
					strokeWidth={1.5}
				/>
				<text
					x={highlight.peak.x + 16}
					y={highlight.peak.y - 80}
					fill={colors.accent}
					style={{
						fontFamily: mono,
						fontSize: 20,
						fontWeight: 700,
						letterSpacing: '0.1em',
					}}
				>
					PEAK{' '}
					{(
						(FIELD.top + HIGHLIGHT * FIELD.spacing - highlight.peak.y) /
						200
					).toFixed(2)}
				</text>
			</g>
		</svg>
	);
};

const Readout: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const rows = [
		['SEED', '0x2F9A'],
		['NOISE', 'SIMPLEX 3D'],
		['FIELD', `${LINES} × ${POINTS}`],
		['TIME', `t = ${(frame / fps).toFixed(2)}s`],
	];

	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
			{rows.map(([label, value], i) => {
				const enter = interpolate(frame, [34 + i * 5, 50 + i * 5], [0, 1], {
					...clamp,
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				});
				return (
					<div
						key={label}
						style={{
							display: 'flex',
							width: 470,
							justifyContent: 'space-between',
							fontFamily: mono,
							fontSize: 26,
							letterSpacing: '0.1em',
							color: colors.paper,
							opacity: enter,
							translate: `${(1 - enter) * -24}px 0`,
							borderBottom: '1px solid rgba(243, 239, 230, 0.16)',
							paddingBottom: 12,
						}}
					>
						<span style={{opacity: 0.5}}>{label}</span>
						<span style={{fontVariantNumeric: 'tabular-nums'}}>{value}</span>
					</div>
				);
			})}
		</div>
	);
};

export const Generative: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#0B0B0F'}}>
			<RidgeField />
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
					text="Generative"
					start={10}
					stagger={2}
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 112,
						lineHeight: 0.84,
						letterSpacing: '-0.045em',
						color: colors.paper,
						paddingTop: 8,
					}}
				/>
				<RiseText
					text="systems."
					start={18}
					stagger={2}
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 132,
						lineHeight: 0.9,
						color: colors.accent,
						paddingRight: 18,
						paddingBottom: '0.16em',
						marginBottom: '-0.16em',
					}}
				/>
				<Interactive.Div
					name="Caption"
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 44,
						lineHeight: 1.2,
						color: '#F3EFE6',
						marginTop: 34,
						marginBottom: 56,
						width: 520,
						opacity: interpolate(frame, [28, 44], [0, 0.75], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					Rules, noise and time — no two frames alike.
				</Interactive.Div>
				<Readout />
			</div>
			<ChapterTag
				index="05"
				title="Generative"
				color={colors.paper}
				start={8}
			/>
		</AbsoluteFill>
	);
};
