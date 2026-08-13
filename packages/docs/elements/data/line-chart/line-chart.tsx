import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const {fontFamily} = loadFont('normal', {
	subsets: ['latin'],
	weights: ['700', '800'],
});

const data = [
	{label: 'Mar', value: 24},
	{label: 'Apr', value: 32},
	{label: 'May', value: 29},
	{label: 'Jun', value: 45},
	{label: 'Jul', value: 51},
	{label: 'Aug', value: 63},
	{label: 'Sep', value: 74},
];

const CHART_WIDTH = 1400;
const CHART_HEIGHT = 520;
const PLOT_PADDING = 128;
const POINT_OUTER_RADIUS = 15;
const MAX_VALUE = 80;

export const LineChart: React.FC = () => {
	const frame = useCurrentFrame();
	const points = data.map(({label, value}, index) => ({
		label,
		value,
		x:
			PLOT_PADDING +
			(index / (data.length - 1)) * (CHART_WIDTH - PLOT_PADDING * 2),
		y: CHART_HEIGHT - (value / MAX_VALUE) * CHART_HEIGHT,
	}));
	const linePath = points.reduce((path, {x, y}, index) => {
		if (index === 0) {
			return `M ${x} ${y}`;
		}

		return `${path} L ${x} ${y}`;
	}, '');
	const firstPoint = points[0];
	const latestPoint = points[points.length - 1];
	const areaPath = `${linePath} L ${latestPoint.x + POINT_OUTER_RADIUS} ${latestPoint.y} L ${latestPoint.x + POINT_OUTER_RADIUS} ${CHART_HEIGHT} L ${firstPoint.x - POINT_OUTER_RADIUS} ${CHART_HEIGHT} L ${firstPoint.x - POINT_OUTER_RADIUS} ${firstPoint.y} Z`;

	return (
		<Interactive.Div
			name="Chart"
			style={{
				color: '#111827',
				display: 'flex',
				flexDirection: 'column',
				fontFamily,
				fontVariantNumeric: 'tabular-nums',
				gap: 84,
				height: '100%',
				justifyContent: 'center',
			}}
		>
			<Interactive.H1
				name="Title"
				style={{
					color: '#111827',
					fontSize: 76,
					fontWeight: 800,
					letterSpacing: -3.8,
					lineHeight: 0.95,
					margin: 0,
					translate: '0 -32px',
				}}
			>
				Monthly active users
			</Interactive.H1>
			<div
				style={{
					height: CHART_HEIGHT,
					marginBottom: 64,
					position: 'relative',
				}}
			>
				{[80, 40, 0].map((value) => (
					<div
						key={value}
						style={{
							left: `${((PLOT_PADDING - POINT_OUTER_RADIUS) / CHART_WIDTH) * 100}%`,
							position: 'absolute',
							right: `${((PLOT_PADDING - POINT_OUTER_RADIUS) / CHART_WIDTH) * 100}%`,
							top: `${((MAX_VALUE - value) / MAX_VALUE) * 100}%`,
						}}
					>
						<div
							style={{
								borderTop: '2px solid #d1d5db',
								opacity: interpolate(frame, [6, 30], [0, 1], {
									easing: Easing.bezier(0.22, 1, 0.36, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								position: 'absolute',
								width: '100%',
							}}
						/>
						<Interactive.Div
							name="Y-axis label"
							style={{
								color: '#6b7280',
								fontSize: 40,
								fontWeight: 700,
								opacity: interpolate(frame, [6, 30], [0, 1], {
									easing: Easing.bezier(0.22, 1, 0.36, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								position: 'absolute',
								right: 'calc(100% + 32px)',
								textAlign: 'left',
								translate: '0 -50%',
								whiteSpace: 'nowrap',
								width: 94,
							}}
						>
							{value}K
						</Interactive.Div>
					</div>
				))}
				<svg
					viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
					preserveAspectRatio="none"
					style={{
						height: '100%',
						overflow: 'visible',
						position: 'absolute',
						width: '100%',
					}}
				>
					<path
						d={areaPath}
						fill="#2858e8"
						opacity={interpolate(frame, [48, 68], [0, 0.1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
					/>
					<Interactive.Path
						name="Trend line"
						d={linePath}
						fill="none"
						opacity={interpolate(frame, [14, 15], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						pathLength={1}
						stroke="#2858e8"
						strokeDasharray="1 1"
						strokeDashoffset={interpolate(frame, [14, 58], [1, 0], {
							easing: Easing.bezier(0, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={12}
					/>
					{points.map(({label, x, y}, index) => (
						<circle
							key={label}
							cx={x}
							cy={y}
							fill="#ffffff"
							r={interpolate(frame, [22 + index * 6, 30 + index * 6], [0, 11], {
								easing: Easing.bezier(0.34, 1.56, 0.64, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})}
							stroke="#2858e8"
							strokeWidth={8}
						/>
					))}
				</svg>
				{data.map(({label}, index) =>
					index % 2 === 0 ? (
						<Interactive.Div
							key={label}
							name="X-axis label"
							style={{
								color: '#4b5563',
								fontSize: 40,
								fontWeight: 700,
								left: `${(PLOT_PADDING / CHART_WIDTH + (index / (data.length - 1)) * ((CHART_WIDTH - PLOT_PADDING * 2) / CHART_WIDTH)) * 100}%`,
								opacity: interpolate(frame, [6, 30], [0, 1], {
									easing: Easing.bezier(0.22, 1, 0.36, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								position: 'absolute',
								top: 'calc(100% + 64px)',
								translate: '-50% 0',
							}}
						>
							{label}
						</Interactive.Div>
					) : null,
				)}
				<div
					style={{
						left: `${(latestPoint.x / CHART_WIDTH) * 100}%`,
						position: 'absolute',
						top: `${(latestPoint.y / CHART_HEIGHT) * 100}%`,
						translate: '-50% -140%',
					}}
				>
					<Interactive.Div
						name="Latest value"
						style={{
							backgroundColor: '#2858e8',
							borderRadius: 12,
							color: '#ffffff',
							fontSize: 44,
							fontWeight: 800,
							letterSpacing: -1.5,
							lineHeight: 1,
							opacity: interpolate(frame, [60, 68], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							padding: '18px 24px',
							whiteSpace: 'nowrap',
						}}
					>
						{latestPoint.value}K
					</Interactive.Div>
				</div>
			</div>
		</Interactive.Div>
	);
};
