import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const labelStyle: React.CSSProperties = {
	color: '#0f172a',
	fontFamily: 'sans-serif',
	fontSize: 44,
	fontWeight: 800,
};

const imageStyle: React.CSSProperties = {
	height: '100%',
	objectFit: 'cover',
	width: '100%',
};

const InterpolateOutputEffectScaleComparison: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#e2e8f0',
				flexDirection: 'row',
				gap: 92,
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 24,
				}}
			>
				<Interactive.Div
					name="Linear CSS scale"
					style={{
						backgroundColor: '#f8fafc',
						border: '6px solid #0f172a',
						boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
						height: 420,
						overflow: 'hidden',
						scale: interpolate(frame, [0, 30], [0.001, 1], {
							easing: Easing.spring({damping: 200}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'linear',
						}),
						width: 420,
					}}
				>
					<Img
						src={staticFile('1.jpg')}
						width={420}
						height={420}
						style={imageStyle}
					/>
				</Interactive.Div>
				<div style={labelStyle}>Linear</div>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 24,
				}}
			>
				<Interactive.Div
					name="Exponential CSS scale"
					style={{
						backgroundColor: '#f8fafc',
						border: '6px solid #0f172a',
						boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
						height: 420,
						overflow: 'hidden',
						scale: interpolate(frame, [0, 30], [0.001, 1], {
							easing: Easing.spring({damping: 200}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'exponential',
						}),
						width: 420,
					}}
				>
					<Img
						src={staticFile('1.jpg')}
						width={420}
						height={420}
						style={imageStyle}
					/>
				</Interactive.Div>
				<div style={labelStyle}>Exponential</div>
			</div>
		</AbsoluteFill>
	);
};

export default InterpolateOutputEffectScaleComparison;
