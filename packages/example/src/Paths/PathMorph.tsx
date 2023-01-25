import {interpolatePath} from '@remotion/paths';
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const path1 =
	'M94.5001 332C47.0001 233.5 -9.09994 56.1999 146.5 135C341 233.5 291 426 475.5 353C623.1 294.6 649.667 154 644.5 91C734.333 47 900.5 9.79997 846.5 213';
const path2 =
	'M94.1703 715.596C37.5 635.5 -9.42966 439.796 146.17 518.596C340.67 617.096 273 708.5 457.5 635.5C605.1 577.1 556 503.5 704 596.596C872.5 666.5 652 441 867.5 565.5';

const PathMorph: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		fps,
		frame,
		config: {damping: 200},
	});

	const path = interpolatePath(progress, path1, path2);

	return (
		<svg
			width="1080"
			height="1080"
			viewBox="0 0 1080 1080"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d={path} stroke="blue" strokeWidth="42" />
		</svg>
	);
};

export default PathMorph;
