import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const SurfaceFixture: React.FC = () => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline
			.set(selector('[data-panel]'), {opacity: 1, '--hue': 20})
			.to(
				selector('[data-panel]'),
				{
					x: 150,
					rotation: 270,
					borderRadius: 44,
					'--hue': 280,
					duration: 2,
					ease: 'none',
				},
				0,
			)
			.to(
				selector('[data-svg-rect]'),
				{
					attr: {x: 188, rx: 24, fill: '#B8FF5A'},
					rotation: 90,
					transformOrigin: '50% 50%',
					duration: 2,
					ease: 'power2.inOut',
				},
				0,
			)
			.to(
				selector('[data-pulse]'),
				{
					scale: 1.5,
					repeat: 1,
					yoyo: true,
					duration: 0.5,
					ease: 'sine.inOut',
				},
				0.25,
			)
			.to(
				selector('[data-keyframe]'),
				{
					keyframes: [
						{y: -34, rotation: -20},
						{x: 80, y: 0, rotation: 20},
						{x: 160, y: -20, rotation: 0},
					],
					duration: 2,
					ease: 'none',
				},
				0,
			);
	});

	return (
		<AbsoluteFill
			ref={scope}
			style={{background: '#080910', overflow: 'hidden'}}
		>
			<div
				data-panel
				style={
					{
						'--hue': 20,
						position: 'absolute',
						width: 72,
						height: 72,
						left: 32,
						top: 26,
						opacity: 0,
						background: 'hsl(var(--hue) 90% 55%)',
					} as React.CSSProperties
				}
			/>
			<svg width="320" height="180" viewBox="0 0 320 180">
				<rect
					data-svg-rect
					x="24"
					y="118"
					width="66"
					height="30"
					rx="2"
					fill="#7C5CFF"
				/>
				<circle data-pulse cx="270" cy="45" r="16" fill="#FF5F8F" />
			</svg>
			<div
				data-keyframe
				style={{
					position: 'absolute',
					width: 24,
					height: 24,
					left: 65,
					bottom: 12,
					background: '#fff',
				}}
			/>
		</AbsoluteFill>
	);
};

export default SurfaceFixture;
