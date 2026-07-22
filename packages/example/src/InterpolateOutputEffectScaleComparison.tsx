import React from 'react';
import {
	AbsoluteFill,
	Img,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const labelStyle: React.CSSProperties = {
	color: '#0f172a',
	fontFamily: 'sans-serif',
	fontSize: 32,
	fontWeight: 800,
	textAlign: 'center',
};

const imageStyle: React.CSSProperties = {
	height: '100%',
	objectFit: 'cover',
	width: '100%',
};

const cardSlotStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	height: 400,
	justifyContent: 'center',
	width: 400,
};

const InterpolateOutputEffectScaleComparison: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#e2e8f0',
				display: 'grid',
				gridTemplateColumns: '400px 400px',
				gridTemplateRows: 'auto auto',
				columnGap: 88,
				rowGap: 24,
				justifyContent: 'center',
				paddingTop: 32,
				paddingBottom: 32,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
				}}
			>
				<div style={cardSlotStyle}>
					<Interactive.Div
						name="Linear CSS scale"
						style={{
							backgroundColor: '#f8fafc',
							border: '6px solid #0f172a',
							boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
							height: 200,
							overflow: 'hidden',
							scale: interpolate(frame, [0, 30], [0, 2], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'linear',
							}),
							width: 200,
						}}
					>
						<Img
							src={staticFile('1.jpg')}
							width={200}
							height={200}
							style={imageStyle}
						/>
					</Interactive.Div>
				</div>
				<div style={labelStyle}>Linear 0 to 2</div>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
				}}
			>
				<div style={cardSlotStyle}>
					<Interactive.Div
						name="Perceptual CSS scale"
						style={{
							backgroundColor: '#f8fafc',
							border: '6px solid #0f172a',
							boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
							height: 200,
							overflow: 'hidden',
							scale: interpolate(frame, [0, 30], [0, 2], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							}),
							width: 200,
						}}
					>
						<Img
							src={staticFile('1.jpg')}
							width={200}
							height={200}
							style={imageStyle}
						/>
					</Interactive.Div>
				</div>
				<div style={labelStyle}>Perceptual 0 to 2</div>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
					gridColumn: '1 / 3',
					justifySelf: 'center',
				}}
			>
				<div style={cardSlotStyle}>
					<Interactive.Div
						name="Perceptual negative CSS scale"
						style={{
							backgroundColor: '#f8fafc',
							border: '6px solid #0f172a',
							boxShadow: '0 28px 80px rgba(15, 23, 42, 0.28)',
							height: 200,
							overflow: 'hidden',
							scale: interpolate(frame, [0, 30], [0, -2], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							}),
							width: 200,
						}}
					>
						<Img
							src={staticFile('1.jpg')}
							width={200}
							height={200}
							style={imageStyle}
						/>
					</Interactive.Div>
				</div>
				<div style={labelStyle}>Perceptual 0 to -2</div>
			</div>
		</AbsoluteFill>
	);
};

export default InterpolateOutputEffectScaleComparison;
