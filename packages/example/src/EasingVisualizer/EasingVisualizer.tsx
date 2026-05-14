import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const T_MIN = -0.18;
const T_MAX = 1.18;
const Y_MIN = -0.45;
const Y_MAX = 1.75;

type EasingSample = {
	name: string;
	fn: (t: number) => number;
};

const EASINGS: EasingSample[] = [
	{name: 'linear', fn: Easing.linear},
	{name: 'ease', fn: Easing.ease},
	{name: 'quad', fn: Easing.quad},
	{name: 'cubic', fn: Easing.cubic},
	{name: 'poly(4)', fn: Easing.poly(4)},
	{name: 'sin', fn: Easing.sin},
	{name: 'circle', fn: Easing.circle},
	{name: 'exp', fn: Easing.exp},
	{name: 'elastic()', fn: Easing.elastic()},
	{name: 'back()', fn: Easing.back()},
	{name: 'bounce', fn: Easing.bounce},
	{
		name: 'bezier(0.8,0.22,0.96,0.65)',
		fn: Easing.bezier(0.8, 0.22, 0.96, 0.65),
	},
	{name: 'inOut(quad)', fn: Easing.inOut(Easing.quad)},
	{name: 'out(circle)', fn: Easing.out(Easing.circle)},
];

const sampleCurve = (fn: (t: number) => number, count: number) => {
	const pts: {t: number; y: number}[] = [];
	for (let i = 0; i < count; i++) {
		const t = T_MIN + (i / (count - 1)) * (T_MAX - T_MIN);
		const y = fn(t);
		if (Number.isFinite(y)) {
			pts.push({t, y});
		}
	}

	return pts;
};

const MiniChart: React.FC<{
	name: string;
	fn: (t: number) => number;
	playheadT: number;
	width: number;
	height: number;
}> = ({name, fn, playheadT, width, height}) => {
	const padL = 36;
	const padR = 10;
	const padT = 22;
	const padB = 18;
	const innerW = width - padL - padR;
	const innerH = height - padT - padB;

	const pathD = useMemo(() => {
		const pts = sampleCurve(fn, 220);
		if (pts.length === 0) {
			return '';
		}

		const xScale = (t: number) =>
			padL + ((t - T_MIN) / (T_MAX - T_MIN)) * innerW;
		const yScale = (y: number) =>
			padT + innerH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

		return pts
			.map((p, i) => {
				const x = xScale(p.t);
				const y = yScale(p.y);
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
			})
			.join(' ');
	}, [fn, innerH, innerW, padL, padT]);

	const xScale = (t: number) => padL + ((t - T_MIN) / (T_MAX - T_MIN)) * innerW;
	const yScale = (y: number) =>
		padT + innerH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

	const playY = fn(playheadT);
	const playYFinite = Number.isFinite(playY);
	const px = xScale(playheadT);
	const py = playYFinite ? yScale(playY) : null;

	return (
		<svg width={width} height={height} style={{display: 'block'}}>
			<title>{name}</title>
			<rect width={width} height={height} fill="#141418" rx={6} />
			{/* [0,1] band */}
			<rect
				x={xScale(0)}
				y={padT}
				width={xScale(1) - xScale(0)}
				height={innerH}
				fill="rgba(120,160,255,0.06)"
			/>
			<text
				x={padL}
				y={14}
				fill="#9aa0ae"
				fontSize={11}
				fontFamily="system-ui, sans-serif"
			>
				{name}
			</text>
			{/* axes */}
			<line
				x1={padL}
				x2={padL + innerW}
				y1={yScale(0)}
				y2={yScale(0)}
				stroke="#2a2e38"
				strokeWidth={1}
			/>
			<line
				x1={xScale(0)}
				x2={xScale(0)}
				y1={padT}
				y2={padT + innerH}
				stroke="#3d4454"
				strokeWidth={1}
			/>
			<line
				x1={xScale(1)}
				x2={xScale(1)}
				y1={padT}
				y2={padT + innerH}
				stroke="#3d4454"
				strokeWidth={1}
			/>
			<text
				x={xScale(0)}
				y={height - 4}
				fill="#5c6370"
				fontSize={9}
				fontFamily="system-ui, sans-serif"
				textAnchor="middle"
			>
				0
			</text>
			<text
				x={xScale(1)}
				y={height - 4}
				fill="#5c6370"
				fontSize={9}
				fontFamily="system-ui, sans-serif"
				textAnchor="middle"
			>
				1
			</text>
			<path
				d={pathD}
				fill="none"
				stroke="#6ae3ff"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{py !== null ? (
				<>
					<line
						x1={px}
						x2={px}
						y1={padT}
						y2={padT + innerH}
						stroke="rgba(255,200,120,0.35)"
						strokeWidth={1}
						strokeDasharray="4 3"
					/>
					<circle
						cx={px}
						cy={py}
						r={5}
						fill="#ffb86c"
						stroke="#1a1a1f"
						strokeWidth={2}
					/>
				</>
			) : (
				<text
					x={px}
					y={padT + innerH / 2}
					fill="#ff6b6b"
					fontSize={10}
					fontFamily="system-ui, sans-serif"
					textAnchor="middle"
				>
					NaN
				</text>
			)}
		</svg>
	);
};

export const EasingVisualizer: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();

	const playheadT = interpolate(
		frame,
		[0, Math.max(1, durationInFrames - 1)],
		[T_MIN, T_MAX],
	);

	const cols = 4;
	const gap = 14;
	const marginX = 28;
	const marginY = 88;
	const titleH = 52;
	const usableW = width - marginX * 2;
	const usableH = height - marginY - titleH;
	const cellW = (usableW - gap * (cols - 1)) / cols;
	const rows = Math.ceil(EASINGS.length / cols);
	const cellH = (usableH - gap * (rows - 1)) / rows;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0b0b0e',
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: marginX,
					right: marginX,
					top: 20,
				}}
			>
				<div style={{color: '#e8eaed', fontSize: 22, fontWeight: 600}}>
					Easing overshoot lab
				</div>
				<div
					style={{
						color: '#8b919d',
						fontSize: 13,
						marginTop: 6,
						lineHeight: 1.45,
					}}
				>
					Playhead sweeps <code style={{color: '#b8c0d0'}}>t</code> from {T_MIN}{' '}
					to {T_MAX}. Shaded strip is the usual animation domain [0, 1].{' '}
					<code style={{color: '#b8c0d0'}}>circle</code>,{' '}
					<code style={{color: '#b8c0d0'}}>bounce</code>, and{' '}
					<code style={{color: '#b8c0d0'}}>bezier</code> clamp{' '}
					<code style={{color: '#b8c0d0'}}>t</code> before evaluating; others
					may extend (e.g. <code style={{color: '#b8c0d0'}}>linear</code>,{' '}
					<code style={{color: '#b8c0d0'}}>quad</code>
					).
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: marginX,
					top: titleH + marginY / 2,
					display: 'grid',
					gridTemplateColumns: `repeat(${cols}, 1fr)`,
					gap,
					width: usableW,
				}}
			>
				{EASINGS.map((e) => (
					<MiniChart
						key={e.name}
						name={e.name}
						fn={e.fn}
						playheadT={playheadT}
						width={Math.floor(cellW)}
						height={Math.floor(cellH)}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
