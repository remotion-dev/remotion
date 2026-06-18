import React from 'react';
import {AbsoluteFill, CanvasImage} from 'remotion';
import {samplePosterize2d} from './sample-posterize-2d';
import {sampleRgbShiftWebgl} from './sample-rgb-shift-webgl';

const SAMPLE_IMAGE = 'https://remotion.media/transition-bg-blue.jpg';

const tileStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
	border: '1px solid #334155',
	backgroundColor: '#020617',
	overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
	position: 'absolute',
	left: 24,
	bottom: 24,
	fontFamily: 'monospace',
	fontSize: 32,
	fontWeight: 700,
	color: 'white',
	textShadow: '0 2px 12px black',
};

const Tile: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
}> = ({label, children}) => {
	return (
		<div style={tileStyle}>
			<div style={{position: 'relative', width: '100%', height: '100%'}}>
				{children}
				<div style={labelStyle}>{label}</div>
			</div>
		</div>
	);
};

export const CustomEffectsSample: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0f172a',
				display: 'flex',
				flexDirection: 'row',
				gap: 24,
				padding: 24,
			}}
		>
			<Tile label="custom 2D: posterize">
				<CanvasImage
					src={SAMPLE_IMAGE}
					width={960}
					height={1080}
					fit="cover"
					style={{width: '100%', height: '100%'}}
					effects={[samplePosterize2d({levels: 16, amount: 1})]}
				/>
			</Tile>
			<Tile label="custom WebGL2: RGB shift">
				<CanvasImage
					src={SAMPLE_IMAGE}
					width={960}
					height={1080}
					fit="cover"
					style={{width: '100%', height: '100%'}}
					effects={[sampleRgbShiftWebgl({amount: 80})]}
				/>
			</Tile>
		</AbsoluteFill>
	);
};
