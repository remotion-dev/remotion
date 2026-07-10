import {scale as scaleEffect} from '@remotion/effects/scale';
import React from 'react';
import {
	AbsoluteFill,
	Img,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const panelStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexDirection: 'column',
	gap: 24,
};

const imageFrameStyle: React.CSSProperties = {
	backgroundColor: '#f8fafc',
	border: '6px solid #0f172a',
	boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
	height: 420,
	overflow: 'hidden',
	width: 420,
};

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
			<Sequence name="Linear scale effect" layout="none">
				<div style={panelStyle}>
					<div style={imageFrameStyle}>
						<Img
							src={staticFile('1.jpg')}
							width={420}
							height={420}
							style={imageStyle}
							effects={[
								scaleEffect({
									scale: interpolate(frame, [0, 119], [1, 4], {
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										output: 'linear',
									}),
								}),
							]}
						/>
					</div>
					<div style={labelStyle}>Linear</div>
				</div>
			</Sequence>
			<Sequence name="Exponential scale effect" layout="none">
				<div style={panelStyle}>
					<div style={imageFrameStyle}>
						<Img
							src={staticFile('1.jpg')}
							width={420}
							height={420}
							style={imageStyle}
							effects={[
								scaleEffect({
									scale: interpolate(frame, [0, 119], [1, 4], {
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										output: 'exponential',
									}),
								}),
							]}
						/>
					</div>
					<div style={labelStyle}>Exponential</div>
				</div>
			</Sequence>
		</AbsoluteFill>
	);
};

export default InterpolateOutputEffectScaleComparison;
