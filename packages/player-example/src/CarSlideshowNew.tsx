import React from 'react';
import {
	interpolate,
	interpolateColors,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const CarSlideshow: React.FC<{
	readonly title: string;
}> = ({title}) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const left = interpolate(frame, [0, durationInFrames], [width, width * -1]);
	const backGroundColor = interpolateColors(
		frame,
		[0, Math.floor(durationInFrames / 2), durationInFrames],
		['red', 'hotpink', 'green'],
	);
	return (
		<div
			style={{
				backgroundColor: backGroundColor,
				width,
				height,
				position: 'absolute',
				left: 0,
				top: 0,
			}}
		>
			<h1
				style={{
					fontSize: '5em',
					fontWeight: 'bold',
					position: 'absolute',
					top: height / 2 - 100,
					left,
					color: 'white',
					whiteSpace: 'nowrap',
				}}
			>
				{title}
			</h1>
		</div>
	);
};

export default CarSlideshow;
