import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
	title: string;
};

const CarSlideshow = ({title}: Props) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const left = interpolate(frame, [0, durationInFrames], [width, width * -1]);
	if (frame === 200) {
		throw new Error('crash');
	}
	return (
		<div
			style={{
				backgroundColor: 'hotpink',
				width: width,
				height: height,
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
					color: 'black',
					whiteSpace: 'nowrap',
				}}
			>
				{title}
			</h1>
		</div>
	);
};

export default CarSlideshow;
