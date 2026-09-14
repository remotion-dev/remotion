import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const cards = [
	{number: '01', label: 'Frame locked', color: '#B8FF5A'},
	{number: '02', label: 'Random access', color: '#7C5CFF'},
	{number: '03', label: 'Nested rhythm', color: '#FF5F8F'},
];

const title = ['TIMELINES', 'MEET', 'REMOTION'];

const GsapShowcase: React.FC = () => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		const titleWords = selector('[data-title-word]');
		const cardElements = selector('[data-card]');
		const metrics = selector('[data-metric]');

		timeline
			.set(selector('[data-stage]'), {opacity: 1})
			.from(selector('[data-kicker]'), {
				y: 24,
				opacity: 0,
				letterSpacing: '0.7em',
				duration: 0.65,
				ease: 'power3.out',
			})
			.from(
				titleWords,
				{
					yPercent: 130,
					rotateX: -70,
					opacity: 0,
					transformOrigin: '50% 100%',
					duration: 0.9,
					stagger: 0.1,
					ease: 'power4.out',
				},
				0.18,
			)
			.from(
				selector('[data-rule]'),
				{scaleX: 0, duration: 1.1, transformOrigin: '0% 50%', ease: 'expo.out'},
				0.42,
			)
			.from(
				cardElements,
				{
					y: 150,
					scale: 0.68,
					rotate: (index: number) => (index - 1) * 9,
					opacity: 0,
					duration: 1,
					stagger: {each: 0.13, from: 'center'},
					ease: 'back.out(1.45)',
				},
				0.92,
			)
			.to(
				selector('[data-orbit]'),
				{rotation: 360, duration: 5.4, ease: 'none'},
				0,
			)
			.to(
				selector('[data-glow]'),
				{x: 680, y: -160, scale: 1.65, duration: 4.5, ease: 'sine.inOut'},
				0,
			)
			.addLabel('metrics', 2)
			.from(
				metrics,
				{y: 28, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out'},
				'metrics',
			)
			.to(
				cardElements,
				{
					y: -15,
					duration: 0.3,
					stagger: {each: 0.08, from: 'edges'},
					repeat: 1,
					yoyo: true,
					ease: 'power2.inOut',
				},
				'metrics+=0.35',
			)
			.addLabel('outro', 4.65)
			.to(
				[...titleWords, ...metrics, ...selector('[data-kicker]')],
				{y: -34, opacity: 0, duration: 0.42, stagger: 0.035, ease: 'power2.in'},
				'outro',
			)
			.to(
				cardElements,
				{
					y: 100,
					opacity: 0,
					scale: 0.82,
					duration: 0.55,
					stagger: 0.06,
					ease: 'back.in(1.3)',
				},
				'outro+=0.08',
			)
			.fromTo(
				selector('[data-wipe]'),
				{scaleX: 0},
				{
					scaleX: 1,
					duration: 0.7,
					transformOrigin: '0% 50%',
					ease: 'expo.inOut',
				},
				'outro+=0.35',
			)
			.from(
				selector('[data-final]'),
				{y: 54, opacity: 0, duration: 0.7, ease: 'power4.out'},
				'outro+=0.86',
			);
	});

	return (
		<AbsoluteFill
			ref={scope}
			style={{
				background: '#090A0F',
				color: '#F7F7F2',
				fontFamily: 'Arial, Helvetica, sans-serif',
				overflow: 'hidden',
			}}
		>
			<div data-stage style={{position: 'absolute', inset: 0, opacity: 0}}>
				<div
					data-glow
					style={{
						position: 'absolute',
						width: 580,
						height: 580,
						left: -250,
						bottom: -260,
						borderRadius: '50%',
						background:
							'radial-gradient(circle, rgba(124,92,255,.45), rgba(124,92,255,0) 68%)',
						filter: 'blur(12px)',
					}}
				/>

				<div
					data-orbit
					style={{
						position: 'absolute',
						width: 700,
						height: 700,
						right: -330,
						top: -330,
						border: '1px solid rgba(184,255,90,.18)',
						borderRadius: '50%',
					}}
				>
					<div
						style={{
							position: 'absolute',
							width: 18,
							height: 18,
							left: 91,
							top: 78,
							borderRadius: '50%',
							background: '#B8FF5A',
							boxShadow: '0 0 38px #B8FF5A',
						}}
					/>
				</div>

				<div style={{position: 'absolute', inset: '62px 74px'}}>
					<div
						data-kicker
						style={{
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: '0.24em',
							color: '#B8FF5A',
						}}
					>
						REMOTION × GSAP · DETERMINISTIC ADAPTER
					</div>

					<div style={{marginTop: 22, perspective: 900}}>
						{title.map((word) => (
							<div
								key={word}
								style={{
									height: 82,
									overflow: 'hidden',
									fontSize: 76,
									fontWeight: 900,
									lineHeight: 0.98,
									letterSpacing: '-0.055em',
								}}
							>
								<div data-title-word>{word}</div>
							</div>
						))}
					</div>

					<div
						data-rule
						style={{
							width: 600,
							height: 4,
							marginTop: 22,
							background: '#B8FF5A',
						}}
					/>

					<div style={{display: 'flex', gap: 18, marginTop: 38}}>
						{cards.map((card) => (
							<div
								data-card
								key={card.number}
								style={{
									width: 258,
									height: 152,
									padding: '20px 22px',
									boxSizing: 'border-box',
									border: '1px solid rgba(255,255,255,.16)',
									borderRadius: 22,
									background:
										'linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.045))',
									boxShadow: '0 24px 80px rgba(0,0,0,.35)',
									backdropFilter: 'blur(16px)',
								}}
							>
								<div
									style={{
										fontSize: 13,
										fontWeight: 800,
										color: card.color,
										letterSpacing: '0.15em',
									}}
								>
									{card.number}
								</div>
								<div
									style={{
										fontSize: 27,
										fontWeight: 800,
										marginTop: 48,
										letterSpacing: '-0.035em',
									}}
								>
									{card.label}
								</div>
							</div>
						))}
					</div>

					<div
						style={{
							display: 'flex',
							gap: 34,
							marginTop: 30,
							color: 'rgba(247,247,242,.62)',
							fontSize: 13,
							fontWeight: 700,
							letterSpacing: '0.12em',
						}}
					>
						<div data-metric>FRAME → SECONDS</div>
						<div data-metric>PAUSED → SEEKED</div>
						<div data-metric>SAME FRAME → SAME PIXELS</div>
					</div>
				</div>

				<div
					data-wipe
					style={{
						position: 'absolute',
						inset: 0,
						background: '#B8FF5A',
						transform: 'scaleX(0)',
					}}
				/>
				<div
					data-final
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						color: '#090A0F',
					}}
				>
					<div style={{fontSize: 18, fontWeight: 800, letterSpacing: '0.25em'}}>
						THE TIMELINE IS YOURS
					</div>
					<div
						style={{
							fontSize: 82,
							fontWeight: 900,
							letterSpacing: '-0.06em',
							marginTop: 8,
						}}
					>
						THE CLOCK IS REMOTION&apos;S.
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export default GsapShowcase;
