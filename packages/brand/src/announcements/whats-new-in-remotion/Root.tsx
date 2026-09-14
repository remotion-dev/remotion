import type {CalculateMetadataFunction} from 'remotion';
import {Composition, Folder} from 'remotion';
import {CodeTransitionDemo} from './CodeTransitionDemo';
import type {MyCompositionProps} from './Composition';
import {
	MyComposition,
	MyCompositionSchema,
	SILENCES,
	VIDEO_FILES,
} from './Composition';
import './index.css';
import {Scene1} from './Scene1';
import {Scene2} from './Scene2';
import {Scene3} from './Scene3';
import {Scene4} from './Scene4';
import {Scene5} from './Scene5';
import {Scene6} from './Scene6';
import {Scene7} from './Scene7';
import {Scene8} from './Scene8';
import {Scene9} from './Scene9';
import {Scene10} from './Scene10';
import {Scene11} from './Scene11';

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<MyCompositionProps> = ({
	props,
}) => {
	let totalFrames = 0;
	for (const file of VIDEO_FILES) {
		const silence = SILENCES[file];
		const trimBefore = Math.floor(silence.leadingEnd * FPS);
		const trimAfter = Math.ceil(silence.trailingStart * FPS);
		totalFrames += trimAfter - trimBefore;
	}

	return {
		durationInFrames: totalFrames,
		defaultOutName: `whats-new-${props.platform}`,
	};
};

export const WhatsNewInRemotion: React.FC = () => {
	return (
		<>
			<Folder name="Chapters">
				<Composition
					id="Chapter01-Intro"
					component={Scene1}
					durationInFrames={114}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter02-LightLeaks"
					component={Scene2}
					durationInFrames={763}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter03-SoundEffects"
					component={Scene3}
					durationInFrames={1266}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter04-RenderOnVercel"
					component={Scene4}
					durationInFrames={1119}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter05-NewSkills"
					component={Scene5}
					durationInFrames={669}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter06-WebRendererProgress"
					component={Scene6}
					durationInFrames={881}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter07-Agents"
					component={Scene7}
					durationInFrames={1053}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter08-Rspack"
					component={Scene8}
					durationInFrames={789}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter09-VisualMode"
					component={Scene9}
					durationInFrames={510}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter10-Mediabunny"
					component={Scene10}
					durationInFrames={421}
					fps={30}
					width={1920}
					height={1080}
				/>
				<Composition
					id="Chapter11-Outro"
					component={Scene11}
					durationInFrames={742}
					fps={30}
					width={1920}
					height={1080}
					schema={MyCompositionSchema}
					defaultProps={{platform: 'youtube'}}
				/>
			</Folder>
			<Composition
				id="WhatsNew"
				component={MyComposition}
				durationInFrames={300}
				fps={FPS}
				width={1920}
				height={1080}
				schema={MyCompositionSchema}
				defaultProps={{platform: 'youtube'} satisfies MyCompositionProps}
				calculateMetadata={calculateMetadata}
			/>

			<Composition
				id="CodeTransitionDemo"
				component={CodeTransitionDemo}
				durationInFrames={90}
				fps={FPS}
				width={1920}
				height={1080}
			/>
		</>
	);
};
