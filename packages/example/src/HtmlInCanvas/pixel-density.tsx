import React from 'react';
import {AbsoluteFill, HtmlInCanvas} from 'remotion';

const Tile: React.FC<{
	readonly label: string;
	readonly pixelDensity: number;
}> = ({label, pixelDensity}) => {
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
			<HtmlInCanvas
				width={50}
				height={50}
				pixelDensity={pixelDensity}
				style={{
					borderRadius: 10,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: 50,
						height: 50,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
						color: 'white',
						fontFamily: 'sans-serif',
						fontSize: 14,
						fontWeight: 700,
					}}
				>
					Hi
				</div>
			</HtmlInCanvas>
			<div
				style={{
					color: 'white',
					fontFamily: 'sans-serif',
					fontSize: 9,
					textAlign: 'center',
				}}
			>
				{label}
			</div>
		</div>
	);
};

export const HtmlInCanvasPixelDensity: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#111827',
				flexDirection: 'row',
				gap: 14,
				justifyContent: 'center',
			}}
		>
			<Tile label="1x" pixelDensity={1} />
			<Tile label="2x" pixelDensity={2} />
			<Tile label="10x" pixelDensity={10} />
		</AbsoluteFill>
	);
};
