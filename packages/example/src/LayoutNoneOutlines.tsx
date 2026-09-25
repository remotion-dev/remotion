import React, {useRef} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';

const card: React.CSSProperties = {
	position: 'absolute',
	width: 180,
	height: 120,
	borderRadius: 16,
	display: 'grid',
	placeItems: 'center',
	fontSize: 24,
	fontWeight: 600,
};

// This component deliberately returns siblings, so inspecting Sequence's JSX
// children alone would not find the elements that make up its outline.
const Siblings: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<div style={{...card, left: 480, top: 210, background: '#2563eb'}}>
				First child
			</div>
			<Sequence layout="none" name="Nested wrapperless child">
				<div
					style={{
						...card,
						left: 730 + Math.sin(frame / 30) * 60,
						top: 300,
						background: '#7c3aed',
					}}
				>
					Moving child
				</div>
			</Sequence>
			{frame >= 90 ? (
				<div style={{...card, left: 1000, top: 240, background: '#b45309'}}>
					Appears at 3s
				</div>
			) : null}
		</>
	);
};

export const LayoutNoneOutlines: React.FC = () => {
	const outlineRef = useRef<HTMLDivElement | null>(null);
	return (
		<AbsoluteFill
			style={{background: '#0f172a', color: 'white', fontFamily: 'sans-serif'}}
		>
			<h1 style={{margin: '48px 60px 12px', fontSize: 40}}>
				Outlines without wrappers
			</h1>
			<p style={{margin: '0 60px', fontSize: 23, color: '#cbd5e1'}}>
				Select the named sequences in the timeline. Scrub past 3s to add a
				child.
			</p>
			<Sequence layout="none" name="Single rotated element">
				<div
					style={{
						...card,
						left: 90,
						top: 250,
						background: '#0f766e',
						rotate: '-15deg',
					}}
				>
					Single element
				</div>
			</Sequence>
			<Sequence layout="none" name="Automatic group of siblings">
				<Siblings />
			</Sequence>
			<div style={{position: 'absolute', left: 80, top: 530, fontSize: 28}}>
				<Sequence layout="none" name="Text and display contents">
					Direct text{' '}
					<span style={{display: 'contents'}}>
						<span style={{color: '#38bdf8'}}>and a boxless wrapper</span>
					</span>
				</Sequence>
			</div>
			<Sequence
				layout="none"
				name="Explicit outlineRef wins"
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{...card, left: 720, top: 500, background: '#be185d'}}
				>
					Explicit target
				</div>
				<div
					style={{...card, left: 960, top: 500, border: '2px dashed #64748b'}}
				>
					Outside outline
				</div>
			</Sequence>
		</AbsoluteFill>
	);
};
