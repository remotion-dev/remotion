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
	AbsoluteFill,
} from 'remotion';

type Props = {
	title: string;
	bgColor: string;
	color: string;
};

export const playerExampleComp = createRef<{
	triggerError: () => void;
}>();

const show = true;

const CarSlideshow = ({title, bgColor, color}: Props) => {
	const {width, height, durationInFrames} = useVideoConfig();

	const [shouldThrowError, setThrowError] = useState(false);

	const dummyText = useCallback(() => {
		if (shouldThrowError) {
			throw new Error('some error');
		}
		return '';
	}, [shouldThrowError]);

	useImperativeHandle(
		playerExampleComp,
		() => {
			return {
				triggerError: () => {
					setThrowError(true);
				},
			};
		},
		[]
	);

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
			<AbsoluteFill
				style={{
					width: '50%',
				}}
			>
				<Video src="https://media.repliq.co/images/5PfG7Oj6LgaWgYiPCT6kiOxXMwa2/69012e32/69012e32_myScreen.mp4" />
			</AbsoluteFill>
			{show ? (
				<AbsoluteFill
					style={{
						left: '50%',
						width: '50%',
					}}
				>
					<Video src="https://app.repliq.co/videos/videoExample1_20.mp4" />
				</AbsoluteFill>
			) : null}
		</div>
	);
};

export default CarSlideshow;
