import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {AbsoluteFill, HtmlInCanvas, Sequence, Solid} from 'remotion';
import {ColorCorrectionRecordingComposition} from '../../ColorCorrectionRecordingComposition';

export const ExploreRemotionColorCorrection = () => {
	return (
		<>
			<Solid
				name="Matching background"
				width={1080}
				height={1080}
				color="#1e2226"
				style={{position: 'absolute'}}
			/>
			<HtmlInCanvas
				width={1080}
				height={1080}
				from={0}
				durationInFrames={180}
				trimBefore={0}
				effects={[
					radialProgressiveBlur({
						start: 0.509,
						center: [0.227, 0.309],
						height: 1.475,
						width: 1.634,
						endBlur: 12,
					}),
				]}
				style={{
					scale: 1.208,
					translate: '178px 140px',
				}}
			>
				<AbsoluteFill
					name="Color correction drag"
					durationInFrames={180}
					style={{
						width: 1620,
						height: 1440,
						left: 20,
						top: 20,
						scale: 0.817,
						rotate: '0 1 -0.1 20deg',
						transformOrigin: 'top left',
						translate: '-17px 50.3px',
					}}
				>
					<Sequence from={-186} layout="none" name="Shadows number drag">
						<ColorCorrectionRecordingComposition />
					</Sequence>
				</AbsoluteFill>
			</HtmlInCanvas>
		</>
	);
};
