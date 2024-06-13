import {createRef, useCallback, useImperativeHandle, useState} from 'react';
import {
	Img,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	Video,
	staticFile,
	Sequence,
	Experimental,
	OffthreadVideo,
} from 'remotion';

type Props = {
	title: string;
	bgColor: string;
	color: string;
};

export const playerExampleComp = createRef<{
	triggerError: () => void;
}>();

const CarSlideshow = ({title, bgColor, color}: Props) => {
	const {width, height} = useVideoConfig();

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
			<Sequence premountFor={100}>
				<OffthreadVideo pauseWhenBuffering src={staticFile('ai.mp4')} />
			</Sequence>
		</div>
	);
};

export default CarSlideshow;
