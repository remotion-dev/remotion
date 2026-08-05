import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';

const panelStyle: React.CSSProperties = {
	position: 'relative',
	minWidth: 0,
	minHeight: 0,
	border: '2px solid rgba(255, 255, 255, 0.16)',
	borderRadius: 24,
	backgroundColor: '#111827',
	perspective: 900,
};

const labelStyle: React.CSSProperties = {
	position: 'absolute',
	left: 20,
	top: 16,
	zIndex: 1,
	fontFamily: 'Arial, sans-serif',
	fontSize: 24,
	fontWeight: 700,
	color: 'white',
	pointerEvents: 'none',
};

const hintStyle: React.CSSProperties = {
	position: 'absolute',
	left: 20,
	bottom: 16,
	zIndex: 1,
	fontFamily: 'Arial, sans-serif',
	fontSize: 16,
	color: 'rgba(255, 255, 255, 0.68)',
	pointerEvents: 'none',
};

const CropContent: React.FC<{
	readonly color: string;
	readonly text: string;
}> = ({color, text}) => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: color,
				backgroundImage:
					'linear-gradient(rgba(255,255,255,0.18) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.18) 2px, transparent 2px)',
				backgroundSize: '48px 48px',
				color: 'white',
				fontFamily: 'Arial, sans-serif',
				fontSize: 44,
				fontWeight: 800,
				letterSpacing: 4,
			}}
		>
			{text}
		</AbsoluteFill>
	);
};

export const SequenceCropTest: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#070b14',
				padding: 40,
				gap: 28,
				fontFamily: 'Arial, sans-serif',
			}}
		>
			<div style={{height: 76, color: 'white'}}>
				<div style={{fontSize: 38, fontWeight: 800}}>
					Sequence crop controls
				</div>
				<div style={{fontSize: 18, color: 'rgba(255, 255, 255, 0.62)'}}>
					Select a named Sequence in the timeline and edit its crop controls.
				</div>
			</div>
			<div
				style={{
					flex: 1,
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gridTemplateRows: '1fr 1fr',
					gap: 28,
				}}
			>
				<div style={panelStyle}>
					<Sequence
						name="Static crop — edit me"
						cropLeft={0.15}
						cropRight={0.08}
						cropTop={0.12}
						cropBottom={0.18}
					>
						<CropContent color="#2563eb" text="STATIC" />
					</Sequence>
					<div style={labelStyle}>Static crop</div>
					<div style={hintStyle}>All four fields are editable</div>
				</div>

				<div style={panelStyle}>
					<Sequence
						name="Animated crop"
						cropLeft={interpolate(frame, [0, 60, 119], [0, 0.45, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						cropRight={interpolate(frame, [0, 60, 119], [0, 0.2, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						cropTop={0.08}
						cropBottom={0.08}
					>
						<CropContent color="#7c3aed" text="ANIMATED" />
					</Sequence>
					<div style={labelStyle}>Animated crop</div>
					<div style={hintStyle}>Scrub frames 0–119</div>
				</div>

				<div
					style={{
						...panelStyle,
						backgroundImage:
							'linear-gradient(90deg, transparent calc(50% - 1px), rgba(255,255,255,0.5) calc(50% - 1px), rgba(255,255,255,0.5) calc(50% + 1px), transparent calc(50% + 1px))',
					}}
				>
					<Sequence
						name="Overlapping crop — midpoint"
						cropLeft={0.6}
						cropRight={0.6}
					>
						<CropContent color="#dc2626" text="OVERLAP" />
					</Sequence>
					<div style={labelStyle}>Overlapping crop</div>
					<div style={hintStyle}>0.6 + 0.6 collapses at the center line</div>
				</div>

				<div style={panelStyle}>
					<Sequence
						name="Perspective crop — inspect outline"
						cropLeft={0.18}
						cropRight={0.22}
						cropTop={0.12}
						cropBottom={0.16}
						style={{
							transform: 'rotateX(-12deg) rotateY(28deg)',
							transformOrigin: 'center',
						}}
					>
						<CropContent color="#059669" text="3D OUTLINE" />
					</Sequence>
					<div style={labelStyle}>Perspective crop</div>
					<div style={hintStyle}>
						Select it to inspect the projected outline
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
