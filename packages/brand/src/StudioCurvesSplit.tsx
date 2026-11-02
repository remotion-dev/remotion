import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {CowColorCorrectionLayers} from './CowColorCorrection';
import {
	ExploreCurvesRecording20261027Composition,
	getCurvesRecordingCursorTranslate,
} from './ExploreCurvesRecording20261027Composition';

const StudioCurvesSplitContent = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const sourceFrame = 151 + (frame * 60 * (98 / 67)) / fps;
	const [, cursorY] = getCurvesRecordingCursorTranslate(
		Math.min(298, Math.max(169, sourceFrame)),
	)
		.split(' ')
		.map(Number.parseFloat);

	return (
		<>
			<Interactive.Div
				name="Left - live corrected preview"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '50%',
					height: '100%',
					overflow: 'hidden',
					scale: 1.413,
					translate: '56.3px -118.5px',
				}}
			>
				<Interactive.Div
					name="Studio preview framing"
					style={{
						position: 'absolute',
						width: 6400,
						height: 4000,
						left: '50%',
						top: '50%',
						translate: '-3100px -1450px',
						transformOrigin: '3100px 1450px',
						rotate: '-0.561848 -0.819813 0.110604 27.005026deg',
						scale: Math.min(width / 2560, height / 1600) * 0.5,
					}}
				>
					<CowColorCorrectionLayers
						// The displayed curve point and the correction share the source clock.
						amount={interpolate(
							cursorY,
							[558.8713235294118, 650.3823529411765],
							[0, 1],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						)}
					/>
				</Interactive.Div>
			</Interactive.Div>
			<Interactive.Div
				name="Right - RGB curve controls"
				style={{
					backgroundColor: '#1e2226',
					position: 'absolute',
					left: '50%',
					top: 0,
					width: '50%',
					height: '100%',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						width: 958,
						height: 1440,
						left: '50%',
						top: '50%',
						translate: '-50% -50%',
						scale: Math.min((width / 2 - 128) / 958, (height - 96) / 1440),
					}}
				>
					<AbsoluteFill
						name="Original curve drag and cursor"
						trimBefore={(151 / 60) * fps}
						durationInFrames={(196 / 60) * fps}
						playbackRate={98 / 67}
						style={{
							scale: 2.131,
							rotate: '-0.561848 0.819813 -0.110604 27.005026deg',
							translate: '338.8px 602.6px',
						}}
					>
						<ExploreCurvesRecording20261027Composition />
					</AbsoluteFill>
				</div>
			</Interactive.Div>
		</>
	);
};

export const StudioCurvesSplit = Interactive.create({
	Component: StudioCurvesSplitContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
