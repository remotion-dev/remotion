import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const panel: React.CSSProperties = {
	position: 'relative',
	flex: 1,
	height: 420,
	border: '2px solid #20232a',
	overflow: 'hidden',
	backgroundColor: '#f4f6f8',
};

const label: React.CSSProperties = {
	position: 'absolute',
	top: 24,
	left: 24,
	fontFamily: 'sans-serif',
	fontSize: 32,
	fontWeight: 700,
	color: '#20232a',
	zIndex: 1,
};

const frameLabel: React.CSSProperties = {
	position: 'absolute',
	bottom: 24,
	left: 24,
	fontFamily: 'monospace',
	fontSize: 28,
	color: '#20232a',
	zIndex: 1,
};

const MovingDot: React.FC<{
	readonly accentColor: string;
	readonly title: string;
}> = ({accentColor, title}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [0, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill>
			<div style={label}>{title}</div>
			<div
				style={{
					position: 'absolute',
					left: 70 + progress * 360,
					top: 175,
					width: 110,
					height: 110,
					borderRadius: 55,
					backgroundColor: accentColor,
					boxShadow: '0 18px 40px rgba(0, 0, 0, 0.22)',
				}}
			/>
			<div style={frameLabel}>child frame {frame}</div>
		</AbsoluteFill>
	);
};

const TimelineMarker: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const x = interpolate(frame, [0, durationInFrames - 1], [0, 100]);

	return (
		<div
			style={{
				position: 'absolute',
				left: 90,
				right: 90,
				bottom: 90,
				height: 8,
				backgroundColor: '#d8dee7',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: `${x}%`,
					top: -16,
					width: 40,
					height: 40,
					borderRadius: 20,
					backgroundColor: '#20232a',
					transform: 'translateX(-20px)',
				}}
			/>
		</div>
	);
};

export const SequenceFreezeExample: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				padding: 72,
				fontFamily: 'sans-serif',
			}}
		>
			<div
				style={{
					fontSize: 46,
					fontWeight: 800,
					color: '#20232a',
					marginBottom: 32,
				}}
			>
				Sequence freeze comparison
			</div>
			<div style={{display: 'flex', gap: 40}}>
				<div style={panel}>
					<Sequence durationInFrames={120}>
						<MovingDot accentColor="#0b84f3" title="Regular Sequence" />
					</Sequence>
				</div>
				<div style={panel}>
					<Sequence durationInFrames={120} freeze={20}>
						<MovingDot accentColor="#ff3232" title="Sequence freeze={20}" />
					</Sequence>
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					right: 72,
					top: 84,
					fontFamily: 'monospace',
					fontSize: 30,
					color: '#20232a',
				}}
			>
				root frame {frame}
			</div>
			<TimelineMarker />
		</AbsoluteFill>
	);
};
