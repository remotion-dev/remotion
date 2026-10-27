import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {vignette} from '@remotion/effects/vignette';
import {HtmlInCanvas, Sequence, Solid, useCurrentFrame} from 'remotion';
import {
	ExploreCurvesRecording20261027Composition,
	getCurvesRecordingCursorTranslate,
} from '../../ExploreCurvesRecording20261027Composition';

export const ExploreRemotionColorCorrection = () => {
	const frame = useCurrentFrame();
	const [cursorX, cursorY] = getCurvesRecordingCursorTranslate(frame + 151)
		.split(' ')
		.map(Number.parseFloat);

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
					rotate: '0.15 1 -0.15 18deg',
				}}
			>
				<HtmlInCanvas
					name="Curves graph"
					width={958}
					height={1440}
					from={0}
					durationInFrames={196}
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
					style={{position: 'absolute', left: 0, top: 0}}
				>
					<Sequence from={-151} layout="none" name="Curve control point drag">
						<ExploreCurvesRecording20261027Composition />
					</Sequence>
				</HtmlInCanvas>
			</div>
		</>
	);
};
