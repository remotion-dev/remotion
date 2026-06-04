import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const panelBackgrounds = ['#f8fbff', '#f9f7ff', '#fff8f2'];
const accentColors = ['#0b84f3', '#7c3aed', '#f97316'];

const PosterizationPanel: React.FC<{
	readonly index: number;
	readonly label: string;
	readonly posterize: number | undefined;
	readonly subtitle: string;
}> = ({index, label, posterize, subtitle}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		...(posterize === undefined ? {} : {posterize}),
	});

	const x = interpolate(progress, [0, 1], [-185, 185]);
	const y = interpolate(progress, [0, 0.5, 1], [80, -95, 80]);
	const rotate = interpolate(progress, [0, 1], [-10, 350]);
	const scale = interpolate(progress, [0, 0.5, 1], [0.94, 1.12, 0.94]);
	const dotSize = interpolate(progress, [0, 0.5, 1], [72, 92, 72]);

	return (
		<div
			style={{
				flex: 1,
				height: '100%',
				position: 'relative',
				overflow: 'hidden',
				backgroundColor: panelBackgrounds[index],
				borderRight:
					index === 2 ? undefined : '2px solid rgba(15, 23, 42, 0.08)',
			}}
		>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						position: 'absolute',
						width: 410,
						height: 2,
						background:
							'linear-gradient(90deg, rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.24), rgba(15, 23, 42, 0))',
						top: 372,
					}}
				/>
				{[0, 1, 2, 3, 4, 5].map((marker) => {
					return (
						<div
							key={marker}
							style={{
								position: 'absolute',
								left: 95 + marker * 82,
								top: 365,
								width: 2,
								height: 14,
								borderRadius: 999,
								backgroundColor: 'rgba(15, 23, 42, 0.18)',
							}}
						/>
					);
				})}
				<div
					style={{
						position: 'absolute',
						width: dotSize,
						height: dotSize,
						borderRadius: 26,
						backgroundColor: accentColors[index],
						boxShadow: `0 28px 60px ${accentColors[index]}55`,
						transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							width: 24,
							height: 24,
							borderRadius: 999,
							backgroundColor: 'rgba(255, 255, 255, 0.92)',
						}}
					/>
				</div>
			</AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: 46,
					right: 46,
					top: 42,
					color: '#0f172a',
				}}
			>
				<div
					style={{
						fontSize: 42,
						fontWeight: 800,
						letterSpacing: -1.4,
						lineHeight: 1,
					}}
				>
					{label}
				</div>
				<div
					style={{
						marginTop: 12,
						fontSize: 22,
						color: 'rgba(15, 23, 42, 0.62)',
						fontWeight: 600,
					}}
				>
					{subtitle}
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 46,
					right: 46,
					bottom: 38,
					height: 10,
					borderRadius: 999,
					backgroundColor: 'rgba(15, 23, 42, 0.08)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: `${progress * 100}%`,
						height: '100%',
						borderRadius: 999,
						backgroundColor: accentColors[index],
					}}
				/>
			</div>
		</div>
	);
};

export const PosterizationComparison: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#ffffff',
				flexDirection: 'row',
				fontFamily:
					'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
			}}
		>
			<PosterizationPanel
				index={0}
				label="Smooth"
				posterize={undefined}
				subtitle="Updates every frame"
			/>
			<PosterizationPanel
				index={1}
				label="Posterized"
				posterize={6}
				subtitle="Updates every 6 frames"
			/>
			<PosterizationPanel
				index={2}
				label="Heavy"
				posterize={15}
				subtitle="Updates every 15 frames"
			/>
		</AbsoluteFill>
	);
};
