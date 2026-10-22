import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const SamePropertyOverlapFixture: React.FC = () => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		// Two tweens contest one property with overlapping windows; lazy
		// start-value recording makes frames depend on visit order unless the
		// adapter primes correctly. Keeps that guarantee honest in the renderer.
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
