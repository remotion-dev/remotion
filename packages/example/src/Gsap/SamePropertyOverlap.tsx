import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const SamePropertyOverlapFixture: React.FC = () => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		// Two tweens fighting over the same property with overlapping windows:
		// the second tween's start value is recorded lazily at first
		// initialization, which made frame state depend on the frame-visit path
		// before the adapter primed in playback order and rendered forward from
		// zero. This fixture keeps that guarantee honest in the real renderer.
		timeline.to(
			selector('[data-contested]'),
			{x: 200, duration: 1, ease: 'none'},
			0,
		);
		timeline.to(
			selector('[data-contested]'),
			{x: 0, duration: 1, ease: 'none'},
			0.5,
		);
	});

	return (
		<AbsoluteFill ref={scope} style={{background: '#05060B'}}>
			<div
				data-contested
				style={{
					width: 60,
					height: 60,
					borderRadius: 12,
					background: '#B8FF5A',
				}}
			/>
		</AbsoluteFill>
	);
};

export default SamePropertyOverlapFixture;
