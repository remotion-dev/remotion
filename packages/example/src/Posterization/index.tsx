import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const accentColor = '#0b84f3';

const PosterizationPanel: React.FC<{
	readonly index: number;
	readonly label: string;
	readonly posterize: number | undefined;
}> = ({index, label, posterize}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		...(posterize === undefined ? {} : {posterize}),
	});

	const translate = interpolate(
		progress,
		[0, 0.5, 1],
		['-185px 80px', '0px -95px', '185px 80px'],
	);
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
						backgroundColor: 'rgba(15, 23, 42, 0.24)',
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
						backgroundColor: accentColor,
						translate,
						rotate: `${rotate}deg`,
						scale,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				></div>
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
						fontSize: 32,
						fontWeight: 500,
						fontFeatureSettings: "'ss03' 1",
						letterSpacing: -1.4,
						lineHeight: 1,
						fontFamily: 'GT Planar, sans-serif',
					}}
				>
					{label}
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
						backgroundColor: accentColor,
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
				flexDirection: 'row',
				fontFamily: 'GT Planar, sans-serif',
				background: 'white',
			}}
		>
			<PosterizationPanel
				index={0}
				label="posterize: 0"
				posterize={undefined}
			/>
			<PosterizationPanel index={1} label="posterize: 3" posterize={3} />
			<PosterizationPanel index={2} label="posterize: 8" posterize={8} />
		</AbsoluteFill>
	);
};
