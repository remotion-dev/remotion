import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

// One timeline outside the Sequence targets an element that only mounts at
// frame 30. A render that starts at frame 0 builds the timeline before the
// element exists; the red layer must still fade in over frames 30-60.
const LateMountFixture: React.FC = () => {
	const scope = useGsapTimeline<HTMLDivElement>(({timeline, selector}) => {
		timeline.fromTo(
			selector('[data-late]'),
			{opacity: 0},
			{opacity: 1, duration: 1, ease: 'none'},
			1,
		);
	});

	return (
		<AbsoluteFill ref={scope} style={{background: '#000'}}>
			<Sequence from={30}>
				<AbsoluteFill data-late style={{background: '#f00'}} />
			</Sequence>
		</AbsoluteFill>
	);
};

export default LateMountFixture;
