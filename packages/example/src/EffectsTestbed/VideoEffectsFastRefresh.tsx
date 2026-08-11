/**
 * Minimal repro for https://github.com/remotion-dev/remotion/issues/7449
 *
 * `<Video>` does not fast-refresh effects when `tint()` params change in code.
 *
 * Repro:
 * 1. `cd packages/example && bun run dev`
 * 2. Open composition `video-effects-fast-refresh`
 * 3. Pause playback (space)
 * 4. Change `TINT_COLOR` or `TINT_AMOUNT` below and save
 * 5. Expected: the video tint updates immediately
 * 6. Bug: the canvas keeps the old tint until you seek or remount
 */
import {tint} from '@remotion/effects/tint';
import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

// --- Edit these values and save to test fast refresh ---
const TINT_COLOR = '#ff5fa2';
const TINT_AMOUNT = 0.2;
// -------------------------------------------------------

const SAMPLE_VIDEO = 'https://remotion.media/bigbuckbunny.mp4';

const panelStyle: React.CSSProperties = {
	flex: 1,
	position: 'relative',
	border: '2px solid #334155',
	borderRadius: 12,
	overflow: 'hidden',
	backgroundColor: '#000',
	minWidth: 0,
};

const labelStyle: React.CSSProperties = {
	position: 'absolute',
	top: 12,
	left: 12,
	right: 12,
	zIndex: 2,
	fontFamily: 'monospace',
	fontSize: 14,
	color: '#f8fafc',
	backgroundColor: 'rgba(2, 6, 23, 0.85)',
	padding: '10px 12px',
	borderRadius: 8,
	lineHeight: 1.5,
	pointerEvents: 'none',
};

const mediaStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const VideoEffectsFastRefresh: React.FC = () => {
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
					fontSize: 22,
					color: '#f8fafc',
					fontWeight: 700,
				}}
			>
				#7449 — Video effects fast refresh
			</div>
			<div
				style={{
					fontFamily: 'monospace',
					fontSize: 13,
					color: '#94a3b8',
					lineHeight: 1.6,
				}}
			>
				Pause, edit <code style={{color: '#f472b6'}}>TINT_COLOR</code> /{' '}
				<code style={{color: '#f472b6'}}>TINT_AMOUNT</code> in{' '}
				<code style={{color: '#f472b6'}}>
					EffectsTestbed/VideoEffectsFastRefresh.tsx
				</code>
				, save. Video should redraw with the new tint immediately.
			</div>
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'row',
					gap: 16,
					minHeight: 0,
				}}
			>
				<div style={panelStyle}>
					<div style={labelStyle}>
						<div style={{fontWeight: 700, marginBottom: 4}}>
							&lt;Video&gt; (bug surface)
						</div>
						<div>
							tint(
							{`{color: '${TINT_COLOR}', amount: ${TINT_AMOUNT}}`})
						</div>
					</div>
					<Video
						src={SAMPLE_VIDEO}
						style={mediaStyle}
						muted
						loop
						objectFit="cover"
						effects={[tint({color: TINT_COLOR, amount: 0.57})]}
					/>
				</div>
				<div style={panelStyle}>
					<div style={labelStyle}>
						<div style={{fontWeight: 700, marginBottom: 4}}>
							&lt;Solid&gt; (control)
						</div>
						<div>
							Same tint — if this updates but Video does not, the bug is
							Video-specific.
						</div>
					</div>
					<Solid
						width={1920}
						height={1080}
						color="#3b82f6"
						style={mediaStyle}
						effects={[tint({color: TINT_COLOR, amount: 0.2})]}
					/>
				</div>
			</div>
		</AbsoluteFill>
	);
};
