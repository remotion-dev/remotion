import {createRef} from 'react';
import {OffthreadVideo, Sequence, staticFile} from 'remotion';

type Props = {
	readonly title: string;
	readonly bgColor: string;
	readonly color: string;
};

export const playerExampleComp = createRef<{
	triggerError: () => void;
}>();

const CarSlideshow = ({bgColor}: Props) => {
	return (
		<div style={{}}>
			<Sequence from={150} premountFor={100}>
				<OffthreadVideo pauseWhenBuffering src={staticFile('2_1.mp4')} />
			</Sequence>
			<Sequence durationInFrames={150} name="first">
				<OffthreadVideo pauseWhenBuffering src={staticFile('1_2.mp4')} />
			</Sequence>
		</div>
	);
};

export default CarSlideshow;
