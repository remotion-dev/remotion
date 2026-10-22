import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';

const SvgRootFixture: React.FC = () => {
	const scope = useGsapTimeline<SVGSVGElement>(({timeline, selector}) =>
		timeline.to(selector('[data-root-circle]'), {
			attr: {cx: 80, fill: '#B8FF5A'},
			duration: 1,
			ease: 'none',
		}),
	);

	return (
		<svg
			ref={scope}
			width="100"
			height="100"
			viewBox="0 0 100 100"
			style={{background: '#000'}}
		>
			<circle data-root-circle cx="20" cy="50" r="14" fill="#7C5CFF" />
		</svg>
	);
};

export default SvgRootFixture;
