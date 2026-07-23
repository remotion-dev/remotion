import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const {fontFamily} = loadFont('normal', {
	subsets: ['latin'],
	weights: ['700', '800'],
});

export const HorizontalBarChart: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Chart"
			style={{
				backgroundColor: '#f7f4ec',
				borderRadius: 28,
				boxSizing: 'border-box',
				color: '#111827',
				display: 'flex',
				flexDirection: 'column',
				fontFamily,
				fontVariantNumeric: 'tabular-nums',
				height: '100%',
				opacity: interpolate(frame, [0, 8, 108, 119], [0, 1, 1, 0], {
					easing: Easing.out(Easing.cubic),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				overflow: 'hidden',
				padding: '72px 80px',
				width: '100%',
			}}
		>
			<Interactive.H1
				name="Title"
				style={{
					fontSize: 76,
					fontWeight: 800,
					letterSpacing: -3.8,
					lineHeight: 0.95,
					margin: 0,
				}}
			>
				Revenue by channel
			</Interactive.H1>

			<div
				style={{
					display: 'flex',
					flex: 1,
					flexDirection: 'column',
					gap: 42,
					justifyContent: 'flex-end',
				}}
			>
				<Interactive.Div
					name="Direct bar"
					style={{
						alignItems: 'center',
						backgroundColor: '#2858e8',
						borderRadius: 12,
						boxSizing: 'border-box',
						clipPath: `inset(0 ${interpolate(frame, [8, 32], [100, 0], {
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}% 0 0)`,
						color: '#ffffff',
						display: 'flex',
						height: 136,
						justifyContent: 'space-between',
						overflow: 'hidden',
						padding: '0 34px',
						width: '100%',
					}}
				>
					<Interactive.Div
						name="Direct label"
						style={{
							fontSize: 40,
							fontWeight: 700,
							lineHeight: 1,
							opacity: interpolate(frame, [24, 30], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							whiteSpace: 'nowrap',
						}}
					>
						Direct
					</Interactive.Div>
					<Interactive.Div
						name="Direct value"
						style={{
							fontSize: 48,
							fontWeight: 800,
							letterSpacing: -1.6,
							lineHeight: 1,
							opacity: interpolate(frame, [25, 31], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							whiteSpace: 'nowrap',
						}}
					>
						$24M
					</Interactive.Div>
				</Interactive.Div>

				<Interactive.Div
					name="Retail bar"
					style={{
						alignItems: 'center',
						backgroundColor: '#2858e8',
						borderRadius: 12,
						boxSizing: 'border-box',
						clipPath: `inset(0 ${interpolate(frame, [14, 38], [100, 0], {
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}% 0 0)`,
						color: '#ffffff',
						display: 'flex',
						height: 136,
						justifyContent: 'space-between',
						overflow: 'hidden',
						padding: '0 34px',
						width: '67%',
					}}
				>
					<Interactive.Div
						name="Retail label"
						style={{
							fontSize: 40,
							fontWeight: 700,
							lineHeight: 1,
							opacity: interpolate(frame, [30, 36], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							whiteSpace: 'nowrap',
						}}
					>
						Retail
					</Interactive.Div>
					<Interactive.Div
						name="Retail value"
						style={{
							fontSize: 48,
							fontWeight: 800,
							letterSpacing: -1.6,
							lineHeight: 1,
							opacity: interpolate(frame, [31, 37], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							whiteSpace: 'nowrap',
						}}
					>
						$16M
					</Interactive.Div>
				</Interactive.Div>

				<Interactive.Div
					name="Partners bar"
					style={{
						alignItems: 'center',
						backgroundColor: '#2858e8',
						borderRadius: 12,
						boxSizing: 'border-box',
						clipPath: `inset(0 ${interpolate(frame, [20, 44], [100, 0], {
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}% 0 0)`,
						color: '#ffffff',
						display: 'flex',
						height: 136,
						justifyContent: 'space-between',
						overflow: 'hidden',
						padding: '0 34px',
						width: '38%',
					}}
				>
					<Interactive.Div
						name="Partners label"
						style={{
							fontSize: 40,
							fontWeight: 700,
							lineHeight: 1,
							opacity: interpolate(frame, [36, 42], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							whiteSpace: 'nowrap',
						}}
					>
						Partners
					</Interactive.Div>
					<Interactive.Div
						name="Partners value"
						style={{
							fontSize: 48,
							fontWeight: 800,
							letterSpacing: -1.6,
							lineHeight: 1,
							opacity: interpolate(frame, [37, 43], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							whiteSpace: 'nowrap',
						}}
					>
						$9M
					</Interactive.Div>
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};
