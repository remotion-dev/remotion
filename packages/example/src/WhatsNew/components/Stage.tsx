import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {easeInOut, lerp} from '../anim';
import {FACE} from '../theme';

export type LayoutName = 'full' | 'split' | 'pip';

export type LayoutKeyframe = {
	readonly at: number;
	readonly layout: LayoutName;
	// Transition length in frames. 1 makes it a hard cut.
	readonly duration?: number;
};

type LayoutState = {
	// The visible card, in composition pixels.
	x: number;
	y: number;
	w: number;
	h: number;
	r: number;
	// Where the 1920x1080 footage is placed and how much it is scaled.
	vx: number;
	vy: number;
	s: number;
	// 0 = edge-to-edge footage, 1 = floating card with border and shadow.
	card: number;
};

const LAYOUTS: Record<LayoutName, LayoutState> = {
	full: {x: 0, y: 0, w: 1920, h: 1080, r: 0, vx: 0, vy: 0, s: 1, card: 0},
	split: {
		x: 1000,
		y: 70,
		w: 840,
		h: 940,
		r: 44,
		vx: 520,
		vy: 63,
		s: 0.9,
		card: 1,
	},
	pip: {
		x: 1540,
		y: 640,
		w: 320,
		h: 360,
		r: 160,
		vx: 1150,
		vy: 560,
		s: 0.55,
		card: 1,
	},
};

export const LAYOUT_TRANSITION = 22;

const mix = (a: LayoutState, b: LayoutState, t: number): LayoutState => ({
	x: lerp(a.x, b.x, t),
	y: lerp(a.y, b.y, t),
	w: lerp(a.w, b.w, t),
	h: lerp(a.h, b.h, t),
	r: lerp(a.r, b.r, t),
	vx: lerp(a.vx, b.vx, t),
	vy: lerp(a.vy, b.vy, t),
	s: lerp(a.s, b.s, t),
	card: lerp(a.card, b.card, t),
});

export const getLayout = (
	frame: number,
	keyframes: readonly LayoutKeyframe[],
): LayoutState => {
	let state = LAYOUTS[keyframes[0].layout];
	for (const keyframe of keyframes.slice(1)) {
		if (frame < keyframe.at) {
			break;
		}
		const t = interpolate(
			frame,
			[keyframe.at, keyframe.at + (keyframe.duration ?? LAYOUT_TRANSITION)],
			[0, 1],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: easeInOut,
			},
		);
		state = mix(state, LAYOUTS[keyframe.layout], t);
	}
	return state;
};

// Where captions sit for a given layout: under the face, inside the card.
export const getCaptionPlacement = (
	frame: number,
	keyframes: readonly LayoutKeyframe[],
) => {
	const l = getLayout(frame, keyframes);
	const pipness = interpolate(l.w, [320, 840], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const width = lerp(Math.min(l.w - 80, 1320), 1100, pipness);
	const centerX = lerp(l.x + l.w / 2, 960, pipness);
	const baseline = lerp(l.y + l.h - lerp(70, 64, l.card), 1030, pipness);
	const fontSize = lerp(lerp(60, 46, l.card), 44, pipness);
	return {
		width,
		fontSize,
		pipness,
		style: {left: centerX - width / 2, bottom: 1080 - baseline},
	};
};

export const Stage: React.FC<{
	readonly keyframes: readonly LayoutKeyframe[];
	readonly children: React.ReactNode;
}> = ({keyframes, children}) => {
	const frame = useCurrentFrame();
	const l = getLayout(frame, keyframes);

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: l.x,
					top: l.y,
					width: l.w,
					height: l.h,
					borderRadius: l.r,
					overflow: 'hidden',
					backgroundColor: '#111',
					boxShadow: `0 ${34 * l.card}px ${90 * l.card}px rgba(16, 24, 48, ${0.32 * l.card})`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: l.vx - l.x,
						top: l.vy - l.y,
						width: 1920,
						height: 1080,
						scale: l.s,
						transformOrigin: '0 0',
						filter: 'contrast(1.07) saturate(1.12) brightness(0.99)',
					}}
				>
					{children}
					<AbsoluteFill
						style={{
							background:
								'radial-gradient(ellipse 75% 80% at 52% 42%, rgba(0,0,0,0) 55%, rgba(8,12,24,0.34) 100%)',
						}}
					/>
				</div>
				<AbsoluteFill
					style={{
						borderRadius: l.r,
						boxShadow: `inset 0 0 0 ${7 * l.card}px rgba(255,255,255,0.96)`,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

// Punch-in framing for a single shot. Every cut switches framing, which hides
// the jump and gives the talking head rhythm. A slow drift keeps it alive.
export const Punch: React.FC<{
	readonly zoom?: number;
	readonly children: React.ReactNode;
}> = ({zoom = 1, children}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				scale: zoom * (1 + frame * 0.00012),
				transformOrigin: `${FACE.x}px ${FACE.y}px`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
