import {Audio} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import React from 'react';
import {Interactive, interpolate, useCurrentFrame} from 'remotion';
import {LightLeakFx} from './components/LightLeakFx';
import {AgentsScene} from './scenes/Agents';
import {BundlingScene} from './scenes/Bundling';
import {ClientSideScene} from './scenes/ClientSide';
import {IntroScene} from './scenes/Intro';
import {LightLeaksScene} from './scenes/LightLeaks';
import {OutroScene} from './scenes/Outro';
import {SkillsScene} from './scenes/Skills';
import {SneakPeekScene} from './scenes/SneakPeek';
import {SoundEffectsScene} from './scenes/SoundEffects';
import {VercelScene} from './scenes/Vercel';

// Every scene is a whole number of beats (16 frames at 112.5 BPM), so each
// chapter starts on a downbeat of the score.
const WhatsNewInner: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<TransitionSeries name="Chapters">
				<TransitionSeries.Sequence
					name="Intro"
					durationInFrames={208}
					premountFor={60}
				>
					<IntroScene style={{overflow: 'visible', flexDirection: 'column'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={1} hueShift={0} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Light leaks"
					durationInFrames={720}
					premountFor={60}
				>
					<LightLeaksScene
						style={{overflow: 'visible', flexDirection: 'column'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={4} hueShift={135} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Sound effects"
					durationInFrames={1152}
					premountFor={60}
				>
					<SoundEffectsScene
						style={{overflow: 'visible', flexDirection: 'column'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={7} hueShift={20} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Render on Vercel"
					durationInFrames={1040}
					premountFor={60}
				>
					<VercelScene style={{overflow: 'visible', flexDirection: 'column'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={10} hueShift={245} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="New skills"
					durationInFrames={608}
					premountFor={60}
				>
					<SkillsScene style={{overflow: 'visible', flexDirection: 'column'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={13} hueShift={185} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Client-side rendering"
					durationInFrames={832}
					premountFor={60}
				>
					<ClientSideScene
						style={{overflow: 'visible', flexDirection: 'column'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={16} hueShift={45} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Better with agents"
					durationInFrames={976}
					premountFor={60}
				>
					<AgentsScene style={{overflow: 'visible', flexDirection: 'column'}} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={19} hueShift={345} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Faster bundling"
					durationInFrames={720}
					premountFor={60}
				>
					<BundlingScene
						style={{overflow: 'visible', flexDirection: 'column'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={22} hueShift={120} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Sneak peek"
					durationInFrames={912}
					premountFor={60}
				>
					<SneakPeekScene
						style={{overflow: 'visible', flexDirection: 'column'}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={32}>
					<LightLeakFx seed={25} hueShift={180} />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence name="Outro" durationInFrames={160}>
					<OutroScene
						style={{
							overflow: 'visible',
							flexDirection: 'column',
							backgroundColor: '#000',
						}}
					/>
				</TransitionSeries.Sequence>
			</TransitionSeries>

			<Audio
				name="Score"
				src={
					'https://remotion.media/announcements/whats-new-in-remotion/cursor/music/score.wav'
				}
				volume={interpolate(
					frame,
					[0, 16, 106, 114, 204, 226, 6250, 6280, 7160, 7172, 7296, 7328],
					[0, 0.3, 0.3, 0.55, 0.55, 0.13, 0.13, 0.17, 0.17, 0.7, 0.7, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				)}
			/>
		</>
	);
};

export const WhatsNew = Interactive.create({
	Component: WhatsNewInner,
	layout: 'absolute-fill',
});
