import {blur} from '@remotion/effects/blur';
import {tint} from '@remotion/effects/tint';
import {StudioInternals} from '@remotion/studio';
import React from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const IMAGE_SIZE = 420;

/** Pixels — blur oscillates between these bounds. */
const BLUR_MIN_PX = 0;
const BLUR_MAX_PX = 18;
/** Blur animation speed (full sine cycles per second). */
const BLUR_CYCLES_PER_SECOND = 0.35;

const labelStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 28,
	fontWeight: 700,
	color: '#f8fafc',
	marginTop: 16,
	textAlign: 'center',
};

const columnStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
};

/**
 * `<AnimatedImage>` with `effects` — animated blur + tint.
 * Composition id: `animated-image-effects`.
 */
const Comp: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const t = (frame / fps) * Math.PI * 2 * BLUR_CYCLES_PER_SECOND;
	const blurRadius =
		BLUR_MIN_PX + (BLUR_MAX_PX - BLUR_MIN_PX) * (0.5 + 0.5 * Math.sin(t));

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#1a1a2e',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				gap: 64,
			}}
		>
			<div style={columnStyle}>
				<AnimatedImage
					src={staticFile('giphy.gif')}
					width={IMAGE_SIZE}
					height={IMAGE_SIZE}
					fit="contain"
					style={{borderRadius: 16}}
				/>
				<div style={labelStyle}>No effects</div>
			</div>
			<div style={columnStyle}>
				<AnimatedImage
					src={staticFile('giphy.gif')}
					width={IMAGE_SIZE}
					height={IMAGE_SIZE}
					fit="contain"
					style={{borderRadius: 16}}
					effects={[
						blur({
							radius: blurRadius,
						}),
						tint({
							color: '#41f500',
							amount: 0.35,
						}),
					]}
				/>
				<div style={labelStyle}>blur + tint</div>
			</div>
		</AbsoluteFill>
	);
};

export const AnimatedImageEffects = StudioInternals.createComposition({
	component: Comp,
	id: 'animated-image-effects',
	width: 1280,
	height: 720,
	durationInFrames: 150,
	fps: 30,
});
