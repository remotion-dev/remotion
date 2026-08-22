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

const growthEasing = Easing.spring({
	damping: 14.5,
	mass: 0.8,
	overshootClamping: false,
	stiffness: 100,
});

const Bar: React.FC<{
	readonly animationDelay: number;
	readonly highlighted: boolean;
	readonly label: string;
	readonly value: number;
}> = ({animationDelay, highlighted, label, value}) => {
	const frame = useCurrentFrame();
	const barAnimationStart = 22 + animationDelay;
	const barAnimationEnd =
		barAnimationStart + 16 + Math.round((value / maxValue) * 8);
	const growthProgress =
		frame >= barAnimationEnd
			? 1
			: interpolate(frame, [barAnimationStart, barAnimationEnd], [0, 1], {
					easing: [growthEasing],
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
	const valueAnimationStart = barAnimationEnd - 8;
	const valueAnimationEnd = barAnimationEnd + 2;
	const valueProgress = interpolate(
		frame,
		[valueAnimationStart, valueAnimationEnd],
		[0, 1],
		{
			easing: growthEasing,
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

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
					<div
						style={{
							bottom: `calc(${growthProgress * 100}% + 12px)`,
							left: 0,
							overflow: frame < valueAnimationEnd ? 'hidden' : 'visible',
							position: 'absolute',
							visibility: frame <= valueAnimationStart ? 'hidden' : 'visible',
							width: '100%',
						}}
					>
						<div
							style={{
								transform: 'perspective(100px)',
								translate: `0 ${(1 - valueProgress) * 100}%`,
								willChange: 'transform',
							}}
						>
							<Interactive.Div
								name="Value"
								style={{
									color: '#111827',
									fontSize: 48,
									fontWeight: 800,
									letterSpacing: -1.6,
									lineHeight: 1,
									textAlign: 'center',
									whiteSpace: 'nowrap',
									width: '100%',
								}}
							>
								{value}
							</Interactive.Div>
						</div>
					</div>
					<div
						style={{
							bottom: 0,
							height: `${growthProgress * 100}%`,
							position: 'absolute',
							width: '100%',
						}}
					>
						<Interactive.Div
							name="Bar"
							style={{
								backgroundColor: highlighted ? '#2858e8' : '#b9c0ca',
								borderRadius: '12px 12px 0 0',
								height: '100%',
								width: '100%',
							}}
						/>
					</div>
				</div>
			</div>
			<div
				style={{
					overflow: frame < barAnimationEnd ? 'hidden' : 'visible',
				}}
			>
				<div
					style={{
						transform: 'perspective(100px)',
						translate: `0 ${(1 - growthProgress) * 100}%`,
						willChange: 'transform',
					}}
				>
					<Interactive.Div
						name="Label"
						style={{
							color: '#111827',
							fontSize: 40,
							fontWeight: 700,
							lineHeight: 1.2,
							textAlign: 'center',
							whiteSpace: 'nowrap',
						}}
					>
						{label}
					</Interactive.Div>
				</div>
			</div>
		</div>
	);
};

export const VerticalBarChart: React.FC = () => {
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
						alignSelf: 'center',
						display: 'flex',
						flex: 1,
						justifyContent: 'space-between',
						minHeight: 0,
						position: 'relative',
						width: 1080,
					}}
				>
					<Interactive.Div
						name="Baseline"
						style={{
							backgroundColor: '#c5cad2',
							bottom: 68,
							height: 3,
							left: '50%',
							position: 'absolute',
							translate: '-50% 50%',
							width: '100%',
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
								animationDelay={index * 24}
								highlighted={highlighted}
								label={label}
								value={value}
							/>
						</div>
					))}
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
