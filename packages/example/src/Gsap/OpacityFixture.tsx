import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const OpacityFixture: React.FC = () => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline.fromTo(
			selector('[data-red]'),
			{opacity: 0},
			{opacity: 1, duration: 1, ease: 'none'},
		);
	});

	return (
		<AbsoluteFill ref={scope} style={{background: '#000'}}>
			<AbsoluteFill data-red style={{background: '#f00'}} />
		</AbsoluteFill>
	);
};

export default OpacityFixture;
