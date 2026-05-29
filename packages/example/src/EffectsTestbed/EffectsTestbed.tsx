import {blur} from '@remotion/effects/blur';
import {halftone} from '@remotion/effects/halftone';
import {tint} from '@remotion/effects/tint';
import {wave} from '@remotion/effects/wave';
import {lightLeak} from '@remotion/light-leaks';
import {Video} from '@remotion/media';
import {starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Solid, useCurrentFrame, useVideoConfig} from 'remotion';

const SAMPLE_VIDEO = 'https://remotion.media/bigbuckbunny.mp4';

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

const AnimatedWaveVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const phase = frame * 0.2;

	return (
		<Video
			src={SAMPLE_VIDEO}
			style={tileVideoStyle}
			muted
			loop
			objectFit="cover"
			effects={[
				wave({
					phase,
					amplitude: 22,
					wavelength: 180,
				}),
			]}
		/>
	);
};

const AnimatedLightLeakSolid: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const progress = durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);

	return (
		<Solid
			width={400}
			height={300}
			color="#ff5fa2"
			style={tileVideoStyle}
			effects={[
				lightLeak({
					seed: 1,
					hueShift: 30,
					progress,
				}),
			]}
		/>
	);
};

const AnimatedStackVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const phase = frame * 0.2;

	return (
		<Video
			src={SAMPLE_VIDEO}
			style={tileVideoStyle}
			muted
			loop
			objectFit="cover"
			effects={[
				starburst({
					colors: ['#ff5fa2', '#ff0000'],
					rays: 12,
				}),
				blur({radius: 24}),
				wave({
					phase,
					amplitude: 22,
					wavelength: 180,
				}),
			]}
		/>
	);
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
						effects={[tint({color: '#ff5fa2', amount: 0.6})]}
					/>
				</Tile>
				<Tile title="halftone" subtitle="circles, dotSize 12, on luminance">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						effects={[
							halftone({
								shape: 'circle',
								dotSize: 12,
								dotSpacing: 12,
								dotColor: '#000',
							}),
						]}
					/>
				</Tile>
				<Tile title="halftone source" subtitle="preserves sampled colors">
					<Video
						src={SAMPLE_VIDEO}
						style={tileVideoStyle}
						muted
						loop
						objectFit="cover"
						effects={[
							halftone({
								shape: 'circle',
								dotSize: 12,
								dotSpacing: 12,
								colorMode: 'source',
							}),
						]}
					/>
				</Tile>
				<Tile title="wave" subtitle="amplitude 22, phase from frame">
					<AnimatedWaveVideo />
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
						effects={[blur({radius: 24})]}
					/>
				</Tile>
				<Tile title="solid" subtitle="light leak, progress from frame">
					<AnimatedLightLeakSolid />
				</Tile>
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="starburst" subtitle="starburst + blur + wave">
					<AnimatedStackVideo />
				</Tile>
			</div>
		</AbsoluteFill>
	);
};
