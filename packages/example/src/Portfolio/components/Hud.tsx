import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {pad} from '../pad';
import {mono} from '../theme';

const toTimecode = (frame: number, fps: number) => {
	const seconds = Math.floor(frame / fps);
	return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frame % fps)}`;
};

const corner: React.CSSProperties = {
	position: 'absolute',
	width: 28,
	height: 28,
	borderColor: '#F3EFE6',
	borderStyle: 'solid',
	borderWidth: 0,
};

// Reel chrome drawn with `difference` so it stays legible on every background.
export const Hud: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill style={{mixBlendMode: 'difference', pointerEvents: 'none'}}>
			<Interactive.Div
				name="HUD"
				style={{
					position: 'absolute',
					inset: 0,
					color: '#F3EFE6',
					fontFamily: mono,
					fontSize: 22,
					fontWeight: 500,
					letterSpacing: '0.18em',
					opacity: interpolate(
						frame,
						[36, 56, durationInFrames - 30, durationInFrames - 10],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				<div
					style={{
						...corner,
						left: 40,
						top: 40,
						borderLeftWidth: 2,
						borderTopWidth: 2,
					}}
				/>
				<div
					style={{
						...corner,
						right: 40,
						top: 40,
						borderRightWidth: 2,
						borderTopWidth: 2,
					}}
				/>
				<div
					style={{
						...corner,
						left: 40,
						bottom: 40,
						borderLeftWidth: 2,
						borderBottomWidth: 2,
					}}
				/>
				<div
					style={{
						...corner,
						right: 40,
						bottom: 40,
						borderRightWidth: 2,
						borderBottomWidth: 2,
					}}
				/>
				<div style={{position: 'absolute', left: 72, top: 52}}>
					MOTION PORTFOLIO — 2026
				</div>
				<div
					style={{
						position: 'absolute',
						right: 72,
						top: 52,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					<span
						style={{
							width: 12,
							height: 12,
							borderRadius: 6,
							backgroundColor: '#F3EFE6',
							opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25,
						}}
					/>
					TC {toTimecode(frame, fps)}
				</div>
				<div
					style={{
						position: 'absolute',
						right: 72,
						bottom: 52,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					F {pad(frame, 4)} / {durationInFrames}
				</div>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: 4,
						backgroundColor: '#F3EFE6',
						scale: `${frame / (durationInFrames - 1)} 1`,
						transformOrigin: '0% 50%',
					}}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
