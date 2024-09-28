import {createRef} from 'react';
import {Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
	title: string;
	bgColor: string;
	color: string;
};

export const playerExampleComp = createRef<{
	triggerError: () => void;
}>();

const CarSlideshow = ({title, bgColor, color}: Props) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const left = interpolate(frame, [0, durationInFrames], [width, width * -1]);

	return (
		<div
			style={{
				backgroundColor: bgColor,
				width,
				height,
				position: 'absolute',
				left: 0,
				top: 0,
			}}
		>
			<Sequence>
				<h1
					style={{
						fontSize: '5em',
						fontWeight: 'bold',
						position: 'absolute',
						top: height / 2 - 100,
						left,
						color,
						whiteSpace: 'nowrap',
					}}
				>
					{title}
				</h1>
			</Sequence>
		</div>
	);
};

export default CarSlideshow;
