import {blur} from '@remotion/effects/blur';
import {halftone} from '@remotion/effects/halftone';
import {tint} from '@remotion/effects/tint';
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

const tileStyle: React.CSSProperties = {
	flex: 1,
	borderRadius: 32,
	overflow: 'hidden',
	border: '4px solid white',
	boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
};

const imageStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

export const ImgEffects = (): React.ReactNode => {
	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(135deg, #111827, #312e81)',
				padding: 64,
				gap: 40,
				flexDirection: 'row',
			}}
		>
			<div style={tileStyle}>
				<Img
					src={staticFile('1.jpg')}
					width={450}
					height={720}
					style={imageStyle}
					effects={[tint({color: '#38bdf8', amount: 0.45})]}
					aria-label="Tinted image"
				/>
			</div>
			<div style={tileStyle}>
				<Img
					src={staticFile('1.jpg')}
					width={450}
					height={720}
					style={imageStyle}
					effects={[
						blur({radius: 6}),
						halftone({
							shape: 'circle',
							dotSize: 14,
							dotSpacing: 14,
						}),
					]}
					aria-label="Blurred halftone image"
				/>
			</div>
		</AbsoluteFill>
	);
};
