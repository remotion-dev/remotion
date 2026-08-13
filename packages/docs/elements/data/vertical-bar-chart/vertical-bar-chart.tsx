import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const {fontFamily} = loadFont('normal', {
	subsets: ['latin'],
	weights: ['700', '800'],
});

const data = [
	{highlighted: false, label: 'Jonny', value: 34},
	{highlighted: false, label: 'Igor', value: 89},
	{highlighted: true, label: 'Mehmet', value: 163},
];

const maxValue = Math.max(...data.map(({value}) => value));

const Bar: React.FC<{
	readonly animationDelay: number;
	readonly highlighted: boolean;
	readonly label: string;
	readonly value: number;
}> = ({animationDelay, highlighted, label, value}) => {
	const frame = useCurrentFrame();
	const barAnimationStart = 22 + animationDelay;
	const barAnimationEnd =
		barAnimationStart + 42 + Math.round((value / maxValue) * 18);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
				height: '100%',
				margin: '0 auto',
				width: 280,
			}}
		>
			<div
				style={{
					alignItems: 'flex-end',
					display: 'flex',
					flex: 1,
				}}
			>
				<div
					style={{
						height: `${(value / maxValue) * 90}%`,
						position: 'relative',
						width: '100%',
					}}
				>
					<Interactive.Div
						name="Value"
						style={{
							color: '#111827',
							fontSize: 48,
							fontWeight: 800,
							left: 0,
							letterSpacing: -1.6,
							lineHeight: 1,
							opacity: interpolate(frame, [68, 84], [0, 1], {
								easing: [Easing.bezier(0.45, 0, 0.55, 1)],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							position: 'absolute',
							textAlign: 'center',
							top: -60,
							whiteSpace: 'nowrap',
							width: '100%',
						}}
					>
						{value}
					</Interactive.Div>
					<Interactive.Div
						cropTop={Math.max(
							0,
							interpolate(frame, [barAnimationStart, barAnimationEnd], [1, 0], {
								easing: [
									Easing.spring({
										allowTail: true,
										damping: 9,
										durationRestThreshold: 0.02,
										mass: 0.8,
										overshootClamping: false,
										stiffness: 80,
									}),
								],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						)}
						name="Bar"
						style={{
							backgroundColor: highlighted ? '#2858e8' : '#d1d5db',
							borderRadius: '12px 12px 0 0',
							height: '100%',
							width: '100%',
						}}
					/>
				</div>
			</div>
			<Interactive.Div
				name="Label"
				style={{
					color: '#111827',
					fontSize: 40,
					fontWeight: 700,
					lineHeight: 1,
					opacity: interpolate(
						frame,
						[34 + animationDelay, 40 + animationDelay],
						[0, 1],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					textAlign: 'center',
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</Interactive.Div>
		</div>
	);
};

export const VerticalBarChart: React.FC = () => {
	return (
		<Interactive.Div
			name="Chart"
			style={{
				display: 'flex',
				flexDirection: 'column',
				fontFamily,
				fontVariantNumeric: 'tabular-nums',
				gap: 42,
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
				}}
			>
				Browser tabs open
			</Interactive.H1>
			<div
				style={{
					display: 'flex',
					flex: 1,
					gap: 80,
					justifyContent: 'center',
					minHeight: 0,
					position: 'relative',
				}}
			>
				<div
					style={{
						backgroundColor: '#c5cad2',
						bottom: 60,
						height: 3,
						left: '50%',
						position: 'absolute',
						translate: '-50% 50%',
						width: 1000,
						zIndex: 1,
					}}
				/>
				{data.map(({highlighted, label, value}, index) => (
					<div
						key={label}
						style={{
							flex: '0 0 280px',
							height: '100%',
						}}
					>
						<Bar
							animationDelay={index * 6}
							highlighted={highlighted}
							label={label}
							value={value}
						/>
					</div>
				))}
			</div>
		</Interactive.Div>
	);
};
