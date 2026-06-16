import React from 'react';
import {AbsoluteFill, CanvasImage} from 'remotion';
import {paletteMap} from './palette-map';

const SAMPLE_IMAGE = 'https://remotion.media/transition-bg-blue.jpg';

const palettes = [
	{
		name: 'original',
		subtitle: 'source image',
		palette: null,
	},
	{
		name: 'solar',
		subtitle: '#111827, #06b6d4, #facc15',
		palette: ['#111827', '#06b6d4', '#facc15'],
	},
	{
		name: 'poster',
		subtitle: '#1d3557, #f1faee, #e63946',
		palette: ['#1d3557', '#f1faee', '#e63946'],
	},
	{
		name: 'ink',
		subtitle: '#0f172a, #64748b, #f8fafc',
		palette: ['#0f172a', '#64748b', '#f8fafc'],
	},
] as const;

const tileStyle: React.CSSProperties = {
	position: 'relative',
	overflow: 'hidden',
	border: '1px solid #1f2937',
	borderRadius: 12,
	backgroundColor: '#020617',
};

const labelStyle: React.CSSProperties = {
	position: 'absolute',
	left: 12,
	right: 12,
	bottom: 12,
	zIndex: 2,
	fontFamily: 'monospace',
	color: '#f8fafc',
	backgroundColor: 'rgba(2, 6, 23, 0.82)',
	padding: '10px 12px',
	borderRadius: 8,
	lineHeight: 1.4,
};

const PaletteTile: React.FC<{
	readonly name: string;
	readonly subtitle: string;
	readonly palette: readonly string[] | null;
}> = ({name, subtitle, palette}) => {
	return (
		<div style={tileStyle}>
			<CanvasImage
				src={SAMPLE_IMAGE}
				width={900}
				height={440}
				fit="cover"
				style={{
					width: '100%',
					height: '100%',
				}}
				effects={palette === null ? [] : [paletteMap({palette, amount: 0.86})]}
			/>
			<div style={labelStyle}>
				<div style={{fontSize: 20, fontWeight: 700}}>{name}</div>
				<div style={{fontSize: 12, color: '#cbd5e1'}}>{subtitle}</div>
			</div>
		</div>
	);
};

export const PaletteMapEffect: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#020617',
				padding: 32,
				gap: 18,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					fontFamily: 'monospace',
					fontSize: 34,
					color: '#f8fafc',
					fontWeight: 700,
				}}
			>
				paletteMap()
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gridTemplateRows: '1fr 1fr',
					gap: 18,
					flex: 1,
					minHeight: 0,
				}}
			>
				{palettes.map((item) => {
					return (
						<PaletteTile
							key={item.name}
							name={item.name}
							subtitle={item.subtitle}
							palette={item.palette}
						/>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
