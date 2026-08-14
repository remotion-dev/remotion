import {pixelate} from '@remotion/effects/pixelate';
import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

const panelStyle: React.CSSProperties = {
	backgroundColor: '#09090b',
	border: '2px solid #3f3f46',
	borderRadius: 24,
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
	color: '#fafafa',
	fontFamily: 'Arial, sans-serif',
	fontSize: 28,
	fontWeight: 600,
	padding: '22px 26px',
};

export const VideoEffectsOutputSize: React.FC<{
	readonly effectsOutputSize?: {width: number; height: number};
}> = ({effectsOutputSize}) => {
	const videos = [
		{label: '512 x 512 source', src: staticFile('blush-0.5x.webm')},
		{label: '2048 x 2048 source', src: staticFile('blush-2x.webm')},
	];

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#18181b',
				color: '#fafafa',
				fontFamily: 'Arial, sans-serif',
				padding: 56,
			}}
		>
			<div style={{fontSize: 44, fontWeight: 700}}>
				Same video, same display size, pixelate({`{blockSize: 128}`})
			</div>
			<div style={{color: '#a1a1aa', fontSize: 26, marginTop: 12}}>
				{effectsOutputSize
					? 'effectsOutputSize: 1024 x 1024'
					: 'Default: effect size follows the encoded source'}
			</div>
			<div style={{display: 'flex', flex: 1, gap: 32, marginTop: 36}}>
				{videos.map((video) => (
					<div key={video.src} style={panelStyle}>
						<div style={labelStyle}>{video.label}</div>
						<Video
							effects={[pixelate({blockSize: 128})]}
							effectsOutputSize={effectsOutputSize}
							muted
							src={video.src}
							style={{height: 650, width: '100%'}}
						/>
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};
