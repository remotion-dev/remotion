import {AbsoluteFill, Interactive, useVideoConfig} from 'remotion';
import {ExploreCurvesRecording20261027Composition} from './ExploreCurvesRecording20261027Composition';

const StudioCurvesContent = () => {
	const {fps, width, height} = useVideoConfig();
	const portrait = width < height;

	return (
		<AbsoluteFill
			name="Fullscreen RGB curve controls"
			style={{
				backgroundColor: '#1f2427',
				overflow: 'hidden',
				scale: 1.065,
			}}
			durationInFrames={67}
			trimBefore={8}
		>
			<Interactive.Div
				name="Curve adjustment close-up"
				style={{
					position: 'absolute',
					width: 958,
					height: 1440,
					left: '50%',
					top: portrait ? '58%' : '88%',
					translate: '-474px -691.2px',
					transformOrigin: '490px 650px',
					rotate: '-0.008405 0.98761 -0.156701 18.643359deg',
					scale: portrait ? width / 1040 : height / 740,
				}}
			>
				<AbsoluteFill
					name="Original curve drag and cursor"
					trimBefore={(151 / 60) * fps}
					playbackRate={1.2}
				>
					<ExploreCurvesRecording20261027Composition />
				</AbsoluteFill>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const StudioCurvesSplit = Interactive.create({
	Component: StudioCurvesContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
