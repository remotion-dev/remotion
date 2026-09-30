import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {ChapterTag} from '../components/ChapterTag';
import {RiseText} from '../components/RiseText';
import {colors, mono, sans, serif} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const values = [42, 58, 51, 77, 69, 94, 88, 121, 109, 146, 158, 196];
const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const CHART_LEFT = 140;
const BASELINE = 930;
const BAR_WIDTH = 56;
const BAR_GAP = 26;
const PX_PER_UNIT = 2.3;

const barX = (i: number) => CHART_LEFT + i * (BAR_WIDTH + BAR_GAP);

const smoothPath = (points: {x: number; y: number}[]) => {
	let d = `M ${points[0].x} ${points[0].y}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;
		d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
	}
	return d;
};

const trendPath = smoothPath(
	values.map((v, i) => ({
		x: barX(i) + BAR_WIDTH / 2,
		y: BASELINE - v * PX_PER_UNIT,
	})),
);
const trendLength = getLength(trendPath);

const Counter: React.FC<{
	readonly to: number;
	readonly start: number;
	readonly duration: number;
	readonly decimals?: number;
	readonly suffix?: string;
}> = ({to, start, duration, decimals = 0, suffix = ''}) => {
	const frame = useCurrentFrame();
	const value = interpolate(frame, [start, start + duration], [0, to], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});
	return (
		<>
			{value.toFixed(decimals)}
			{suffix}
		</>
	);
};

const BarChart: React.FC = () => {
	const frame = useCurrentFrame();
	const trendProgress = interpolate(frame, [66, 118], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.65, 0, 0.35, 1),
	});
	const trend = evolvePath(trendProgress, trendPath);
	const tip = getPointAtLength(trendPath, trendLength * trendProgress) ?? {
		x: barX(0) + BAR_WIDTH / 2,
		y: BASELINE - values[0] * PX_PER_UNIT,
	};
	const badge = interpolate(frame, [116, 132], [0, 1], {
		...clamp,
		easing: Easing.spring({damping: 12}),
	});
	const last = values.length - 1;

	return (
		<svg
			width={1920}
			height={1080}
			viewBox="0 0 1920 1080"
			style={{position: 'absolute', left: 0, top: 0}}
		>
			{[50, 100, 150, 200].map((v, i) => (
				<g key={v}>
					<line
						x1={CHART_LEFT}
						x2={1110}
						y1={BASELINE - v * PX_PER_UNIT}
						y2={BASELINE - v * PX_PER_UNIT}
						stroke={colors.ink}
						strokeOpacity={0.12}
						strokeWidth={1.5}
						strokeDasharray="6 8"
						style={{
							scale: `${interpolate(frame, [12 + i * 4, 44 + i * 4], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})} 1`,
							transformOrigin: `${CHART_LEFT}px 0px`,
						}}
					/>
					<text
						x={1122}
						y={BASELINE - v * PX_PER_UNIT + 7}
						fill={colors.ink}
						fillOpacity={0.45}
						style={{fontFamily: mono, fontSize: 20}}
						opacity={interpolate(
							frame,
							[30 + i * 4, 44 + i * 4],
							[0, 1],
							clamp,
						)}
					>
						{v}k
					</text>
				</g>
			))}
			{values.map((v, i) => {
				const grow = interpolate(frame, [24 + i * 3, 50 + i * 3], [0, 1], {
					...clamp,
					easing: Easing.spring({damping: 13}),
				});
				const height = v * PX_PER_UNIT * grow;
				const isLast = i === last;
				return (
					<g key={i}>
						<rect
							x={barX(i)}
							y={BASELINE - height}
							width={BAR_WIDTH}
							height={Math.max(0, height)}
							rx={6}
							fill={isLast ? colors.accent : colors.ink}
						/>
						<text
							x={barX(i) + BAR_WIDTH / 2}
							y={BASELINE - height + 32}
							textAnchor="middle"
							fill={colors.paper}
							style={{fontFamily: mono, fontSize: 19, fontWeight: 700}}
							opacity={interpolate(height, [60, 90], [0, 1], clamp)}
						>
							{Math.round(v * Math.min(1, grow))}
						</text>
						<text
							x={barX(i) + BAR_WIDTH / 2}
							y={BASELINE + 40}
							textAnchor="middle"
							fill={colors.ink}
							fillOpacity={0.5}
							style={{fontFamily: mono, fontSize: 20}}
							opacity={interpolate(
								frame,
								[20 + i * 2, 34 + i * 2],
								[0, 1],
								clamp,
							)}
						>
							{months[i]}
						</text>
					</g>
				);
			})}
			<line
				x1={CHART_LEFT - 20}
				x2={1110}
				y1={BASELINE}
				y2={BASELINE}
				stroke={colors.ink}
				strokeWidth={3}
				style={{
					scale: `${interpolate(frame, [8, 36], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})} 1`,
					transformOrigin: `${CHART_LEFT - 20}px 0px`,
				}}
			/>
			<path
				d={trendPath}
				fill="none"
				stroke={colors.accent}
				strokeWidth={6}
				strokeLinecap="round"
				strokeDasharray={trend.strokeDasharray}
				strokeDashoffset={trend.strokeDashoffset}
			/>
			{[132, 147, 162, 177].map((at) => {
				const ping = interpolate(frame, [at, at + 16], [0, 1], {
					...clamp,
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				});
				return frame >= at && ping < 1 ? (
					<circle
						key={at}
						cx={tip.x}
						cy={tip.y}
						r={13 + ping * 36}
						fill="none"
						stroke={colors.accent}
						strokeWidth={3}
						opacity={1 - ping}
					/>
				) : null;
			})}
			<circle
				cx={tip.x}
				cy={tip.y}
				r={13}
				fill={colors.accent}
				stroke={colors.paper}
				strokeWidth={5}
				opacity={interpolate(frame, [66, 72], [0, 1], clamp)}
			/>
			<g
				style={{
					scale: badge,
					transformOrigin: `${barX(last) + BAR_WIDTH / 2}px ${BASELINE - values[last] * PX_PER_UNIT - 40}px`,
				}}
			>
				<rect
					x={barX(last) + BAR_WIDTH / 2 - 88}
					y={BASELINE - values[last] * PX_PER_UNIT - 102}
					width={176}
					height={60}
					rx={30}
					fill={colors.ink}
				/>
				<text
					x={barX(last) + BAR_WIDTH / 2}
					y={BASELINE - values[last] * PX_PER_UNIT - 62}
					textAnchor="middle"
					fill={colors.paper}
					style={{fontFamily: sans, fontSize: 30, fontWeight: 800}}
				>
					+367%
				</text>
			</g>
		</svg>
	);
};

const Donut: React.FC = () => {
	const frame = useCurrentFrame();
	const radius = 180;
	const circumference = 2 * Math.PI * radius;
	const sweep = interpolate(frame, [44, 104], [0, 0.78], {
		...clamp,
		easing: Easing.bezier(0.33, 1, 0.68, 1),
	});

	return (
		<svg width={440} height={440} viewBox="0 0 440 440">
			<circle
				cx={220}
				cy={220}
				r={radius}
				fill="none"
				stroke={colors.ink}
				strokeOpacity={0.08}
				strokeWidth={40}
			/>
			<circle
				cx={220}
				cy={220}
				r={radius}
				fill="none"
				stroke={colors.accent}
				strokeWidth={40}
				strokeLinecap="round"
				strokeDasharray={`${circumference * sweep} ${circumference}`}
				style={{rotate: '-90deg', transformOrigin: '220px 220px'}}
				opacity={sweep > 0.002 ? 1 : 0}
			/>
		</svg>
	);
};

export const DataViz: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#F3EFE6'}}>
			<div
				style={{
					position: 'absolute',
					left: 140,
					top: 116,
					display: 'flex',
					alignItems: 'flex-end',
					gap: 36,
				}}
			>
				<RiseText
					name="Data,"
					text="Data,"
					start={14}
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 156,
						lineHeight: 0.84,
						letterSpacing: '-0.05em',
						color: colors.ink,
						paddingBottom: 14,
					}}
				/>
				<RiseText
					name="in motion."
					text="in motion."
					start={20}
					stagger={2}
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 170,
						lineHeight: 0.84,
						color: colors.accent,
						paddingRight: 20,
						paddingBottom: 14,
					}}
				/>
			</div>
			<Interactive.Div
				name="Chart caption"
				style={{
					position: 'absolute',
					left: 140,
					top: 318,
					fontFamily: mono,
					fontSize: 24,
					fontWeight: 500,
					letterSpacing: '0.16em',
					color: '#0B0B0F',
					opacity: interpolate(frame, [26, 40], [0, 0.6], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				MONTHLY REACH · 2026 · IN THOUSANDS
			</Interactive.Div>
			<BarChart />
			<Interactive.Div
				name="Donut"
				style={{
					position: 'absolute',
					left: 1320,
					top: 290,
					scale: interpolate(frame, [36, 60], [0.6, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.spring({damping: 14}),
						output: 'perceptual-scale',
					}),
					opacity: interpolate(frame, [36, 46], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<Donut />
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							fontFamily: sans,
							fontWeight: 800,
							fontSize: 112,
							letterSpacing: '-0.04em',
							lineHeight: 1,
							color: colors.ink,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						<Counter to={78} start={44} duration={60} suffix="%" />
					</div>
					<div
						style={{
							fontFamily: mono,
							fontSize: 20,
							letterSpacing: '0.18em',
							color: colors.ink,
							opacity: 0.55,
							marginTop: 10,
						}}
					>
						WATCH-THROUGH
					</div>
				</div>
			</Interactive.Div>
			<Interactive.Div
				name="KPIs"
				style={{
					position: 'absolute',
					left: 1340,
					top: 790,
					display: 'flex',
					gap: 72,
					opacity: interpolate(frame, [56, 70], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(frame, [56, 76], ['0px 30px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
				}}
			>
				<div>
					<div
						style={{
							fontFamily: sans,
							fontWeight: 800,
							fontSize: 68,
							letterSpacing: '-0.03em',
							color: colors.ink,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						<Counter
							to={2.4}
							start={58}
							duration={50}
							decimals={1}
							suffix="M"
						/>
					</div>
					<div
						style={{
							fontFamily: mono,
							fontSize: 20,
							letterSpacing: '0.18em',
							color: colors.ink,
							opacity: 0.55,
						}}
					>
						VIEWS
					</div>
				</div>
				<div>
					<div
						style={{
							fontFamily: sans,
							fontWeight: 800,
							fontSize: 68,
							letterSpacing: '-0.03em',
							color: colors.ink,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						<Counter
							to={18.2}
							start={62}
							duration={50}
							decimals={1}
							suffix="%"
						/>
					</div>
					<div
						style={{
							fontFamily: mono,
							fontSize: 20,
							letterSpacing: '0.18em',
							color: colors.ink,
							opacity: 0.55,
						}}
					>
						CLICK-THROUGH
					</div>
				</div>
			</Interactive.Div>
			<ChapterTag
				name="Data visualization chapter tag"
				index="03"
				title="Data visualization"
				color={colors.ink}
				start={16}
			/>
		</AbsoluteFill>
	);
};
