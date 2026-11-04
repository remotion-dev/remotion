import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {vignette} from '@remotion/effects/vignette';
import {
	AbsoluteFill,
	HtmlInCanvas,
	Interactive,
	Sequence,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	ExploreCurvesRecording20261027Composition,
	getCurvesRecordingCursorTranslate,
} from '../../ExploreCurvesRecording20261027Composition';
import {EXPLORE_CAMERA_ANGLE} from './camera-angle';

const ExploreRemotionColorCorrectionContent = () => {
	const {fps} = useVideoConfig();
	const frame = (useCurrentFrame() * 60) / fps;
	const [cursorX, cursorY] = getCurvesRecordingCursorTranslate(frame + 151)
		.split(' ')
		.map(Number.parseFloat);

	const graph = (
		<Sequence
			from={(-151 / 60) * fps}
			layout="none"
			name="Curve control point drag"
		>
			<ExploreCurvesRecording20261027Composition />
		</Sequence>
	);

	return (
		<>
			<Solid
				name="Matching background"
				width={1080}
				height={1080}
				color="#1c1e23"
				style={{position: 'absolute'}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 958,
					height: 1080,
					left: 61,
					top: 30,
					overflow: 'visible',
					rotate: EXPLORE_CAMERA_ANGLE,
				}}
			>
				{HtmlInCanvas.isSupported() ? (
					<HtmlInCanvas
						name="Curves graph"
						width={958}
						height={1440}
						from={0}
						durationInFrames={(196 / 60) * fps}
						trimBefore={0}
						effects={[
							radialProgressiveBlur({
								center: [
									Math.min(0.83, Math.max(0.18, cursorX / 958)),
									Math.min(0.68, Math.max(0.25, cursorY / 1440)),
								],
								start: 0.3,
								width: 1.65,
								height: 1.1,
								endBlur: 4,
							}),
							vignette({
								amount: 0.14,
								center: [0.5, 0.457],
								radius: 0.7,
								feather: 0.6,
							}),
						]}
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							scale: 1.18,
							transformOrigin: 'top left',
						}}
					>
						{graph}
					</HtmlInCanvas>
				) : (
					<AbsoluteFill
						name="Curves graph"
						durationInFrames={(196 / 60) * fps}
						style={{
							width: 958,
							height: 1440,
							scale: 1.18,
							transformOrigin: 'top left',
						}}
					>
						{graph}
					</AbsoluteFill>
				)}
			</div>
		</>
	);
};

const ExploreRemotionColorCorrectionPreview = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{backgroundColor: '#1c1e23', overflow: 'hidden'}}
		>
			<div
				style={{
					position: 'absolute',
					width: 1080,
					height: 1080,
					left: '50%',
					top: '50%',
					translate: '-50% -50%',
					scale: Math.min(width / 1080, height / 1080),
				}}
			>
				<ExploreRemotionColorCorrectionContent />
			</div>
		</AbsoluteFill>
	);
};

export const ExploreRemotionColorCorrection = Interactive.create({
	Component: ExploreRemotionColorCorrectionPreview,
	layout: 'absolute-fill',
	schema: {},
});
