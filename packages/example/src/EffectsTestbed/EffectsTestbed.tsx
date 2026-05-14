import {
	blur,
	blurHorizontal,
	blurVertical,
	halftone,
	tint,
	wave,
} from '@remotion/effects';
import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

const SAMPLE_VIDEO = staticFile('bigbuckbunny.mp4');

const Tile: React.FC<{
	readonly title: string;
	readonly subtitle: string;
	readonly children: React.ReactNode;
}> = ({title, subtitle, children}) => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				border: '1px solid #1f2937',
				borderRadius: 12,
				overflow: 'hidden',
				backgroundColor: '#000',
				minWidth: 0,
				minHeight: 0,
			}}
		>
			<div
				style={{
					padding: '10px 14px',
					backgroundColor: '#0b1220',
					borderBottom: '1px solid #1f2937',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<div
					style={{
						fontFamily: 'monospace',
						fontSize: 18,
						color: '#f8fafc',
						fontWeight: 700,
					}}
				>
					{title}
				</div>
				<div
					style={{
						fontFamily: 'monospace',
						fontSize: 12,
						color: '#94a3b8',
					}}
				>
					{subtitle}
				</div>
			</div>
			<div
				style={{
					flex: 1,
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{children}
			</div>
		</div>
	);
};

const tileVideoStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const EffectsTestbed: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#020617',
				padding: 24,
				gap: 16,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					fontFamily: 'monospace',
					fontSize: 28,
					color: '#f8fafc',
					fontWeight: 700,
				}}
			>
				@remotion/effects testbed
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="tint" subtitle="color: '#ff5fa2', amount: 0.6">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						_experimentalEffects={[tint({color: '#ff5fa2', amount: 0.6})]}
					/>
				</Tile>
				<Tile title="halftone" subtitle="circles, dotSize 12, on luminance">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						_experimentalEffects={[
							halftone({
								shape: 'circle',
								dotSize: 12,
								dotSpacing: 12,
								color: '#000',
							}),
						]}
					/>
				</Tile>
				<Tile title="wave" subtitle="amplitude 22, animated">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						_experimentalEffects={[
							wave({
								amplitude: 22,
								wavelength: 180,
								speed: 0.2,
								sliceWidth: 4,
								background: '#020617',
							}),
						]}
					/>
				</Tile>
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="blur" subtitle="separable Gaussian, radius 24">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						_experimentalEffects={[...blur({radius: 24})]}
					/>
				</Tile>
				<Tile title="blurHorizontal" subtitle="radius 24, single axis">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						_experimentalEffects={[blurHorizontal({radius: 24})]}
					/>
				</Tile>
				<Tile title="blurVertical" subtitle="radius 24, single axis">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						_experimentalEffects={[blurVertical({radius: 24})]}
					/>
				</Tile>
			</div>
		</AbsoluteFill>
	);
};
