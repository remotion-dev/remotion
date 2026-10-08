import {Audio} from '@remotion/media';
import {
	AbsoluteFill,
	Composition,
	Folder,
	Interactive,
	useVideoConfig,
} from 'remotion';
import {rollerSkiAsset} from '../assets';
import {BlueprintStage} from './BlueprintStage';
import {CodeCard} from './CodeCard';

// Timing follows src/blueprint/timeline.ts: drop and whip-in at frame 255,
// cuts on the beat of the 113 BPM score.
export const RollerSkiBlueprint: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
			<Audio
				name="Score · drop at 8.5 s"
				src={rollerSkiAsset('blueprint/soundtrack.wav')}
				volume={0.8}
			/>
			<Audio
				name="Whoosh · elevations in"
				src={rollerSkiAsset('blueprint/whoosh-in.wav')}
				from={252}
				volume={0.45}
			/>
			<Audio
				name="Whoosh · elevations out"
				src={rollerSkiAsset('blueprint/whoosh-out.wav')}
				from={354}
				volume={0.35}
			/>
			<Audio
				name="Ratchet · pawl ticks and lock"
				src={rollerSkiAsset('blueprint/ratchet.wav')}
				from={366}
				volume={0.7}
			/>
			<Audio
				name="Whoosh · hero in"
				src={rollerSkiAsset('blueprint/whoosh-hero.wav')}
				from={456}
				volume={0.5}
				premountFor={fps}
			/>
			<BlueprintStage
				name="3D model · hidden-line render"
				durationInFrames={525}
				premountFor={fps}
				lineColor="#1F4FD8"
				lineWidth={1.6}
			/>
			<Interactive.Div
				name="Title"
				from={255}
				durationInFrames={270}
				premountFor={fps}
				style={{
					position: 'absolute',
					zIndex: 1,
					left: 112,
					top: 866,
					fontFamily: 'JetBrains Mono',
					fontSize: 98,
					fontWeight: 700,
					lineHeight: 1.2,
					color: '#1F4FD8',
					whiteSpace: 'pre',
				}}
			>
				{'> ROLLER SKI'}
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const RollerSkiBlueprintCompositions: React.FC = () => {
	return (
		<Folder name="Roller-Ski-Blueprint">
			<Composition
				id="RollerSkiBlueprint"
				component={RollerSkiBlueprint}
				durationInFrames={525}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="BlueprintStage"
				component={BlueprintStage}
				durationInFrames={525}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{lineColor: '#1F4FD8', lineWidth: 1.6}}
			/>
			<Composition
				id="BlueprintCodeCard"
				component={CodeCard}
				durationInFrames={71}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					header: '// ski.system',
					line1: '01 // Swix Roadline Classic, built for classic technique.',
					line2: '02 // 790 mm long, 725 mm from axle to axle.',
					line3: '03 // Hollow aluminum U-frame, lowered center of gravity.',
					line4: '04 // Pre-drilled for Rottefella and SNS/Prolink bindings.',
					typeSeconds: 1.55,
					color: '#1F4FD8',
					tint: '#91A9EC',
					fontSize: 23,
					lineSpacing: 42,
					style: {left: 1010, top: 150},
				}}
			/>
		</Folder>
	);
};
