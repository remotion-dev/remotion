import {Audio} from '@remotion/media';
import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain} from './components/Grain';
import {Hud} from './components/Hud';
import {LightLeakOverlay} from './components/LightLeakOverlay';
import {CubeWave} from './scenes/CubeWave';
import {DataViz} from './scenes/DataViz';
import {Generative} from './scenes/Generative';
import {Interface} from './scenes/Interface';
import {Intro} from './scenes/Intro';
import {KineticType} from './scenes/KineticType';
import {Outro} from './scenes/Outro';
import {ShapeMorph} from './scenes/ShapeMorph';
import {blinds} from './transitions/blinds';
import {circleReveal} from './transitions/circle-reveal';
import {slabWipe} from './transitions/slab-wipe';

// Every cut lands on a bar line of the 120 BPM grid (60 frames per bar,
// starting at frame 150). Transitions are centered on those cut points.
export const Portfolio: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0B0B0F'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence
					name="Intro"
					durationInFrames={150}
					premountFor={30}
				>
					<Intro />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Kinetic type"
					durationInFrames={255}
					premountFor={30}
				>
					<KineticType />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slabWipe({colors: ['#FF4A1C', '#F3EFE6']})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence
					name="Shape & path"
					durationInFrames={207}
					premountFor={30}
				>
					<ShapeMorph />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={circleReveal({
						x: 1320,
						y: 540,
						width: 1920,
						height: 1080,
						ringColor: '#FF4A1C',
					})}
					timing={linearTiming({durationInFrames: 24})}
				/>
				<TransitionSeries.Sequence
					name="Data visualization"
					durationInFrames={204}
					premountFor={30}
				>
					<DataViz />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slide({direction: 'from-bottom'})}
					timing={springTiming({config: {damping: 200}, durationInFrames: 24})}
				/>
				<TransitionSeries.Sequence
					name="Interface"
					durationInFrames={252}
					premountFor={30}
				>
					<Interface />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={36}>
					<LightLeakOverlay />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Generative"
					durationInFrames={195}
					premountFor={30}
				>
					<Generative />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={blinds({count: 12, width: 1920, height: 1080})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence
					name="Dimension"
					durationInFrames={210}
					premountFor={30}
				>
					<CubeWave />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					presentation={slabWipe({
						colors: ['#FF4A1C', '#0B0B0F'],
						direction: 'left',
					})}
					timing={linearTiming({durationInFrames: 30})}
				/>
				<TransitionSeries.Sequence
					name="Outro"
					durationInFrames={195}
					premountFor={30}
				>
					<Outro />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Grain />
			<Hud />
			<Audio
				name="Music"
				src="https://remotion.media/portfolio-reel/v1/music.wav"
				volume={0.6}
			/>
			<Audio
				name="Whoosh — slab wipe"
				src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
				from={384}
				volume={0.6}
			/>
			<Audio
				name="Whoosh — circle reveal"
				src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
				from={564}
				volume={0.5}
			/>
			<Audio
				name="Whoosh — slide"
				src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
				from={744}
				volume={0.5}
			/>
			<Audio
				name="Whip — blinds"
				src="https://remotion.media/portfolio-reel/v1/sfx/whip.wav"
				from={1164}
				volume={0.45}
			/>
			<Audio
				name="Whoosh — slab wipe 2"
				src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
				from={1344}
				volume={0.6}
			/>
		</AbsoluteFill>
	);
};
