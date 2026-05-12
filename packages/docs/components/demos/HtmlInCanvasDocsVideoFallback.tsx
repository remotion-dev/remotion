import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile, useVideoConfig} from 'remotion';

/**
 * Pre-rendered fallback when `HtmlInCanvas.isSupported()` is false.
 * `relativeSrc` is relative to the docs site static root (e.g. `img/foo.mp4`).
 *
 * Typography is sized vs. composition width so it stays legible when the Player
 * scales a 1920×1080 frame down (~500px wide in docs).
 */
export const HtmlInCanvasDocsVideoFallback: React.FC<{
	readonly relativeSrc: string;
}> = ({relativeSrc}) => {
	const {width} = useVideoConfig();
	const fontSize = Math.round(width * 0.052);
	const padY = Math.round(width * 0.022);
	const padX = Math.round(width * 0.028);

	return (
		<AbsoluteFill>
			<Video
				loop
				muted
				objectFit="contain"
				src={staticFile(relativeSrc)}
				style={{
					width: '100%',
					height: '100%',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					padding: `${padY}px ${padX}px`,
					background: 'rgba(0, 0, 0, 0.78)',
					color: '#fff',
					fontSize,
					lineHeight: 1.35,
					fontWeight: 600,
					textAlign: 'center',
					fontFamily: 'var(--ifm-font-family-base)',
				}}
			>
				HTML-in-canvas is not supported in this browser — playing video.
			</div>
		</AbsoluteFill>
	);
};
