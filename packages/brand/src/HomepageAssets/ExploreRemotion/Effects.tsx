import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {AbsoluteFill, HtmlInCanvas, Solid} from 'remotion';
import {EffectsRecordingComposition} from '../../EffectsRecordingComposition';

export const ExploreRemotionEffects = () => {
	return (
		<>
			<Solid
				name="Matching background"
				width={1080}
				height={1080}
				color="#1f2427"
				style={{position: 'absolute'}}
			/>
			<HtmlInCanvas
				width={1080}
				height={1080}
				from={0}
				durationInFrames={513}
				trimBefore={0}
				effects={[
					linearProgressiveBlur({
						end: [1.431, 1.419],
						start: [0.391, 0.535],
						endBlur: 51,
					}),
				]}
			>
				<AbsoluteFill
					name="FX toggle capture"
					style={{
						width: 1568,
						height: 1440,
						left: 80,
						top: -300,
						rotate: '0 1 -0.1 22deg',
						transformOrigin: 'top left',
					}}
				>
					<EffectsRecordingComposition />
				</AbsoluteFill>
			</HtmlInCanvas>
		</>
	);
};
