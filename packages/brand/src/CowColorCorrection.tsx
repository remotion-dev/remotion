import {curves} from '@remotion/effects/curves';
import {
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Direct frame from IMG_0460.MOV at 143/30 seconds, matching the Studio capture.
export const CowColorCorrectionLayers = ({
	amount,
}: {
	readonly amount: number;
}) => {
	return (
		<>
			<Img
				name="Studio UI"
				src="https://remotion.media/timeline-reveal/after-2026-11-02-filmstrip-fixed-9548b256cf19.png"
				style={{position: 'absolute', inset: 0, width: 6400, height: 4000}}
			/>
			<Img
				name="Cow - midtones restored to the original"
				src="https://remotion.media/studio-close-ups/cow-color-correction-324196a50f60.png"
				style={{
					position: 'absolute',
					// Exact preview bounds in the matching 6400 x 4000 Studio capture.
					left: 1553,
					top: 325,
					width: 3095,
					height: 1740,
				}}
				effects={[
					curves({
						channel: 'rgb',
						interpolation: 'smooth',
						// A stronger inverse midtone lift reads clearly at the wider framing.
						// Zero amount restores the original footage, including its colors.
						points: [
							[0, 0],
							[0.5, 0.29],
							[1, 1],
						],
						amount,
					}),
				]}
			/>
		</>
	);
};

const CowColorCorrectionContent = () => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="Studio preview - gentle zoom out"
			style={{
				position: 'absolute',
				width: 6400,
				height: 4000,
				left: '50%',
				top: '50%',
				translate: '-50% -50%',
				scale:
					Math.min(width / 6400, height / 4000) *
					interpolate(frame, [0, durationInFrames - 1], [0.98, 0.92], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
			}}
		>
			<CowColorCorrectionLayers
				amount={interpolate(
					frame,
					[0, 3, 6, 8, 10, 13, 17, 21, 25, 29],
					[1, 1, 0.94, 0.89, 0.8, 0.63, 0.49, 0.3, 0.11, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
			/>
		</Interactive.Div>
	);
};

export const CowColorCorrection = Interactive.create({
	Component: CowColorCorrectionContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
