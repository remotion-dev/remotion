import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

const {fontFamily} = loadFont('normal', {
	subsets: ['latin'],
	weights: ['700', '800'],
});

const data = [
	{highlighted: true, label: 'Jonny', value: 18},
	{highlighted: false, label: 'Igor', value: 17},
	{highlighted: false, label: 'Mehmet', value: 10},
];

const HEIGHT = Math.round(400 / data.length);

const maxValue = Math.max(...data.map(({value}) => value));

const Bar: React.FC<{
	readonly highlighted: boolean;
	readonly label: string;
	readonly value: number;
}> = ({highlighted, label, value}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			cropRight={interpolate(frame, [14, 47], [1, 0], {
				easing: [Easing.bezier(0, 0, 0.58, 1)],
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})}
			name={'Bar'}
			style={{
				alignItems: 'center',
				backgroundColor: highlighted ? '#2858e8' : '#d1d5db',
				borderRadius: 12,
				boxSizing: 'border-box',
				color: highlighted ? '#ffffff' : '#111827',
				display: 'flex',
				height: '100%',
				justifyContent: 'space-between',
				overflow: 'hidden',
				padding: '0 34px',
				width: '100%',
			}}
		>
			<Interactive.Div
				name={'Label'}
				style={{
					fontSize: 40,
					fontWeight: 700,
					lineHeight: 1,
					opacity: interpolate(frame, [26, 32], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</Interactive.Div>
			<Interactive.Div
				name="Value"
				style={{
					fontSize: 48,
					fontWeight: 800,
					letterSpacing: -1.6,
					lineHeight: 1,
					opacity: interpolate(frame, [32, 38], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					whiteSpace: 'nowrap',
				}}
			>
				{value}
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const HorizontalBarChart: React.FC = () => {
	return (
		<Interactive.Div
			name="Background"
			style={{
				alignItems: 'center',
				backgroundColor: '#f5f6f7',
				boxSizing: 'border-box',
				display: 'flex',
				height: '100%',
				justifyContent: 'center',
				padding: 56,
				width: '100%',
			}}
		>
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
						color: '#111827',
					}}
				>
					Team member pull-ups
				</Interactive.H1>
				{data.map(({highlighted, label, value}, index) => (
					<div
						key={label}
						style={{
							height: HEIGHT,
						}}
					>
						<Interactive.Div
							from={8 + index * 6}
							style={{width: `${(value / maxValue) * 100}%`, height: '100%'}}
							showInTimeline={false}
						>
							<Bar highlighted={highlighted} label={label} value={value} />
						</Interactive.Div>
					</div>
				))}
			</Interactive.Div>
		</Interactive.Div>
	);
};
