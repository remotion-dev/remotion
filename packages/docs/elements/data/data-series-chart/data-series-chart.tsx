import {loadFont} from '@remotion/google-fonts/Inter';
import React, {useId} from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['400', '500', '600', '700'],
});

const DATA = [
	{month: 'Jan', revenue: 8000, conversionRate: 2.1},
	{month: 'Feb', revenue: 12000, conversionRate: 2.8},
	{month: 'Mar', revenue: 15000, conversionRate: 3.2},
	{month: 'Apr', revenue: 11000, conversionRate: 2.9},
	{month: 'May', revenue: 18000, conversionRate: 3.8},
	{month: 'Jun', revenue: 22000, conversionRate: 4.2},
] as const;

const COLORS = {
	accent: '#0B84F3',
	barBottom: '#A1A1AA',
	barTop: '#F4F4F5',
	grid: 'rgba(255, 255, 255, 0.09)',
	heading: '#FAFAFA',
	label: '#D4D4D8',
	muted: '#A1A1AA',
	onBar: '#18181B',
} as const;

const VIEWBOX_WIDTH = 1560;
const VIEWBOX_HEIGHT = 864;
const PLOT_LEFT = 165;
const PLOT_RIGHT = 1395;
const PLOT_TOP = 238;
const PLOT_BOTTOM = 716;
const PLOT_WIDTH = PLOT_RIGHT - PLOT_LEFT;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;
const SLOT_WIDTH = PLOT_WIDTH / DATA.length;
const BAR_WIDTH = 122;

const linePoints = DATA.map((item, index) => ({
	x: PLOT_LEFT + SLOT_WIDTH * (index + 0.5),
	y: PLOT_BOTTOM - (item.conversionRate / 5) * PLOT_HEIGHT,
}));

const linePath = linePoints
	.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
	.join(' ');

const segmentLengths = linePoints.slice(1).map((point, index) => {
	const previous = linePoints[index];
	return Math.hypot(point.x - previous.x, point.y - previous.y);
});

const totalLineLength = segmentLengths.reduce((sum, length) => sum + length, 0);

const getLineTip = (progress: number) => {
	const targetLength = progress * totalLineLength;
	let coveredLength = 0;

	for (let index = 0; index < segmentLengths.length; index++) {
		const segmentLength = segmentLengths[index];
		if (coveredLength + segmentLength >= targetLength) {
			const segmentProgress = (targetLength - coveredLength) / segmentLength;
			const start = linePoints[index];
			const end = linePoints[index + 1];

			return {
				x: start.x + (end.x - start.x) * segmentProgress,
				y: start.y + (end.y - start.y) * segmentProgress,
			};
		}

		coveredLength += segmentLength;
	}

	return linePoints[linePoints.length - 1];
};

export const DataSeriesChart: React.FC = () => {
	const frame = useCurrentFrame();
	const id = useId().replaceAll(':', '');
	const barGradientId = `bar-gradient-${id}`;
	const glowFilterId = `line-glow-${id}`;

	const lineProgress = interpolate(frame, [32, 88], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});
	const lineTip = getLineTip(lineProgress);
	const pulse = (Math.sin(frame * 0.32) + 1) / 2;

	return (
		<Interactive.Div
			name="Container"
			style={{
				backgroundColor: '#18181B',
				border: '1px solid rgba(255, 255, 255, 0.08)',
				borderRadius: 24,
				boxShadow: '0 12px 30px rgba(24, 24, 27, 0.18)',
				boxSizing: 'border-box',
				fontFamily: 'Inter, sans-serif',
				fontVariantNumeric: 'tabular-nums',
				height: '100%',
				opacity: interpolate(frame, [0, 10, 104, 119], [0, 1, 1, 0], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				overflow: 'hidden',
				position: 'relative',
				scale: interpolate(frame, [0, 14, 104, 119], [0.96, 1, 1, 0.97], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				transformOrigin: '50% 50%',
				translate: interpolate(
					frame,
					[0, 18, 104, 119],
					['0px 18px', '0px 0px', '0px 0px', '0px -10px'],
					{
						easing: Easing.out(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
				width: '100%',
			}}
		>
			<svg
				aria-label="Monthly revenue and conversion rate from January to June"
				role="img"
				style={{display: 'block', height: '100%', width: '100%'}}
				viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
			>
				<defs>
					<linearGradient id={barGradientId} x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stopColor={COLORS.barTop} />
						<stop offset="100%" stopColor={COLORS.barBottom} />
					</linearGradient>
					<filter
						height="220%"
						id={glowFilterId}
						width="220%"
						x="-60%"
						y="-60%"
					>
						<feGaussianBlur stdDeviation="8" />
					</filter>
				</defs>

				<g
					opacity={interpolate(frame, [2, 16], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
					})}
				>
					<text
						fill={COLORS.muted}
						fontSize="20"
						fontWeight="600"
						x="82"
						y="66"
					>
						Monthly performance
					</text>
					<text
						fill={COLORS.heading}
						fontSize="46"
						fontWeight="600"
						letterSpacing="-1.4"
						x="82"
						y="120"
					>
						Revenue &amp; conversion
					</text>
					<text
						fill={COLORS.muted}
						fontSize="20"
						fontWeight="500"
						x="82"
						y="158"
					>
						January — June
					</text>

					<rect
						fill={`url(#${barGradientId})`}
						height="20"
						rx="6"
						width="20"
						x="1100"
						y="94"
					/>
					<text
						fill={COLORS.label}
						fontSize="20"
						fontWeight="500"
						x="1136"
						y="112"
					>
						Revenue
					</text>
					<line
						stroke={COLORS.accent}
						strokeLinecap="round"
						strokeWidth="6"
						x1="1268"
						x2="1296"
						y1="104"
						y2="104"
					/>
					<circle cx="1282" cy="104" fill={COLORS.accent} r="7" />
					<text
						fill={COLORS.label}
						fontSize="20"
						fontWeight="500"
						x="1312"
						y="112"
					>
						Conversion
					</text>
				</g>

				<g
					opacity={interpolate(frame, [5, 20], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.cubic),
					})}
				>
					{[0, 1, 2, 3, 4, 5].map((tick) => {
						const y = PLOT_BOTTOM - (tick / 5) * PLOT_HEIGHT;
						return (
							<g key={tick}>
								<line
									stroke={COLORS.grid}
									strokeWidth="1"
									x1={PLOT_LEFT}
									x2={PLOT_RIGHT}
									y1={y}
									y2={y}
								/>
								<text
									dominantBaseline="middle"
									fill={COLORS.muted}
									fontSize="18"
									fontWeight="500"
									textAnchor="end"
									x={PLOT_LEFT - 22}
									y={y}
								>
									{tick === 0 ? '$0' : `$${tick * 5}K`}
								</text>
								<text
									dominantBaseline="middle"
									fill={COLORS.muted}
									fontSize="18"
									fontWeight="500"
									x={PLOT_RIGHT + 22}
									y={y}
								>
									{tick}%
								</text>
							</g>
						);
					})}
					<text
						fill={COLORS.muted}
						fontSize="16"
						fontWeight="600"
						letterSpacing="1.4"
						textAnchor="middle"
						transform="rotate(-90 50 477)"
						x="50"
						y="477"
					>
						Revenue
					</text>
					<text
						fill={COLORS.muted}
						fontSize="16"
						fontWeight="600"
						letterSpacing="1.4"
						textAnchor="middle"
						transform="rotate(90 1510 477)"
						x="1510"
						y="477"
					>
						Conversion rate
					</text>
				</g>

				{DATA.map((item, index) => {
					const x = PLOT_LEFT + SLOT_WIDTH * (index + 0.5);
					const targetHeight = (item.revenue / 25000) * PLOT_HEIGHT;
					const barProgress = interpolate(
						frame,
						[10 + index * 6, 34 + index * 6],
						[0, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.spring({
								damping: 16,
								mass: 0.65,
								stiffness: 105,
							}),
						},
					);
					const barHeight = targetHeight * barProgress;
					const barTop = PLOT_BOTTOM - barHeight;

					return (
						<g key={item.month}>
							<rect
								fill={`url(#${barGradientId})`}
								height={Math.max(0, barHeight)}
								rx="16"
								width={BAR_WIDTH}
								x={x - BAR_WIDTH / 2}
								y={barTop}
							/>
							<text
								fill={COLORS.onBar}
								fontSize="21"
								fontWeight="700"
								opacity={interpolate(barProgress, [0.55, 0.9], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}
								textAnchor="middle"
								x={x}
								y={PLOT_BOTTOM - 24}
							>
								${item.revenue / 1000}K
							</text>
							<text
								fill={COLORS.label}
								fontSize="21"
								fontWeight="600"
								opacity={interpolate(
									frame,
									[12 + index * 6, 24 + index * 6],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								)}
								textAnchor="middle"
								x={x}
								y={PLOT_BOTTOM + 48}
							>
								{item.month}
							</text>
						</g>
					);
				})}

				<path
					d={linePath}
					fill="none"
					filter={`url(#${glowFilterId})`}
					opacity="0.55"
					pathLength="1"
					stroke={COLORS.accent}
					strokeDasharray="1"
					strokeDashoffset={1 - lineProgress}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="16"
				/>
				<path
					d={linePath}
					fill="none"
					pathLength="1"
					stroke={COLORS.accent}
					strokeDasharray="1"
					strokeDashoffset={1 - lineProgress}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="7"
				/>

				<g
					opacity={interpolate(frame, [32, 38], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
				>
					<circle
						cx={lineTip.x}
						cy={lineTip.y}
						fill={COLORS.accent}
						opacity={0.14 + pulse * 0.1}
						r={20 + pulse * 7}
					/>
					<circle
						cx={lineTip.x}
						cy={lineTip.y}
						fill={COLORS.accent}
						r={10 + pulse * 1.5}
						stroke={COLORS.heading}
						strokeWidth="4"
					/>
				</g>
			</svg>
		</Interactive.Div>
	);
};
