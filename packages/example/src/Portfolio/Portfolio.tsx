import {Audio} from '@remotion/media';
import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import React from 'react';
import {Interactive, Track} from 'remotion';
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
const PortfolioInner: React.FC = () => {
	return (
		<>
			<TransitionSeries name="Portfolio scenes">
				<TransitionSeries.Sequence
					name="Intro"
					durationInFrames={150}
					premountFor={30}
				>
					<Intro
						style={{
							backgroundColor: '#0B0B0F',
							justifyContent: 'center',
							alignItems: 'center',
							overflow: 'visible',
						}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					name="Kinetic type"
					durationInFrames={255}
					premountFor={30}
				>
					<KineticType
						style={{backgroundColor: '#FF4A1C', overflow: 'visible'}}
					/>
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
					<ShapeMorph
						style={{backgroundColor: '#0B0B0F', overflow: 'visible'}}
					/>
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
					<DataViz style={{backgroundColor: '#F3EFE6', overflow: 'visible'}} />
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
					<Interface
						style={{
							backgroundColor: '#0E0F13',
							backgroundImage:
								'radial-gradient(circle at 70% 48%, rgba(255, 74, 28, 0.22), transparent 42%), radial-gradient(circle at 12% 92%, rgba(96, 110, 255, 0.12), transparent 40%)',
							overflow: 'visible',
						}}
					/>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={36}>
					<LightLeakOverlay />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="Generative"
					durationInFrames={195}
					premountFor={30}
				>
					<Generative
						style={{backgroundColor: '#0B0B0F', overflow: 'visible'}}
					/>
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
					<CubeWave style={{backgroundColor: '#F3EFE6', overflow: 'visible'}} />
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
					<Outro style={{backgroundColor: '#0B0B0F', overflow: 'visible'}} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Grain />
			<Hud
				name="HUD"
				style={{
					mixBlendMode: 'difference',
					pointerEvents: 'none',
					overflow: 'visible',
				}}
			/>
			<Audio
				name="Music"
				src="https://remotion.media/portfolio-reel/v1/music.wav"
				volume={0.6}
			/>
			<Track name="Transition sounds">
				<Audio
					durationInFrames={5}
					name="Whoosh — slab wipe"
					src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
					from={384}
					volume={0.6}
				/>
				<Audio
					durationInFrames={5}
					name="Whoosh — circle reveal"
					src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
					from={564}
					volume={0.5}
				/>
				<Audio
					durationInFrames={5}
					name="Whoosh — slide"
					src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
					from={744}
					volume={0.5}
				/>
				<Audio
					durationInFrames={6}
					name="Whip — blinds"
					src="https://remotion.media/portfolio-reel/v1/sfx/whip.wav"
					from={1164}
					volume={0.45}
				/>
				<Audio
					durationInFrames={5}
					name="Whoosh — slab wipe 2"
					src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
					from={1344}
					volume={0.6}
				/>
			</Track>
		</>
	);
};

export const Portfolio = Interactive.create({
	Component: PortfolioInner,
	schema: {...Interactive.backgroundSchema},
	layout: 'absolute-fill',
});
