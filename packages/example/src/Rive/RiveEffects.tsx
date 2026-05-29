import {blur} from '@remotion/effects/blur';
import {halftone} from '@remotion/effects/halftone';
import {tint} from '@remotion/effects/tint';
import {wave} from '@remotion/effects/wave';
import {RemotionRiveCanvas} from '@remotion/rive';
import {StudioInternals} from '@remotion/studio';
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const RIVE_SRC = 'https://cdn.rive.app/animations/vehicles.riv';

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

const tileRiveStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

const AnimatedBlurRive: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Pulse the blur radius between 0 and 18px to verify that the canvas is
	// redrawn when an effect parameter changes, even between Rive frames.
	const t = (frame / fps) * Math.PI * 2 * 0.35;
	const blurRadius = 9 + 9 * Math.sin(t);

	return (
		<RemotionRiveCanvas
			src={RIVE_SRC}
			style={tileRiveStyle}
			effects={[blur({radius: blurRadius})]}
		/>
	);
};

const AnimatedWaveRive: React.FC = () => {
	const frame = useCurrentFrame();
	const phase = frame * 0.2;

	return (
		<RemotionRiveCanvas
			src={RIVE_SRC}
			style={tileRiveStyle}
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

const StackedRive: React.FC = () => {
	const frame = useCurrentFrame();
	const phase = frame * 0.2;

	return (
		<RemotionRiveCanvas
			src={RIVE_SRC}
			style={tileRiveStyle}
			effects={[
				tint({color: '#ff5fa2', amount: 0.4}),
				wave({
					phase,
					amplitude: 12,
					wavelength: 160,
				}),
				blur({radius: 6}),
			]}
		/>
	);
};

const Comp: React.FC = () => {
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
				@remotion/rive effects testbed
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="baseline" subtitle="no effects">
					<RemotionRiveCanvas src={RIVE_SRC} style={tileRiveStyle} />
				</Tile>
				<Tile title="tint" subtitle="color: '#ff5fa2', amount: 0.6">
					<RemotionRiveCanvas
						src={RIVE_SRC}
						style={tileRiveStyle}
						effects={[tint({color: '#ff5fa2', amount: 0.6})]}
					/>
				</Tile>
				<Tile title="halftone" subtitle="circles, dotSize 12, on luminance">
					<RemotionRiveCanvas
						src={RIVE_SRC}
						style={tileRiveStyle}
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
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'row', gap: 16}}>
				<Tile title="blur" subtitle="separable Gaussian, animated 0→18">
					<AnimatedBlurRive />
				</Tile>
				<Tile title="wave" subtitle="amplitude 22, phase from frame">
					<AnimatedWaveRive />
				</Tile>
				<Tile title="tint + wave + blur" subtitle="effect chain">
					<StackedRive />
				</Tile>
			</div>
		</AbsoluteFill>
	);
};

export const RiveEffectsTestbed = StudioInternals.createComposition({
	component: Comp,
	id: 'rive-effects-testbed',
	width: 1920,
	height: 1080,
	durationInFrames: 300,
	fps: 30,
});
