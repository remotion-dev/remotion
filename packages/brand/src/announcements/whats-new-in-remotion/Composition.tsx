import {LightLeak} from '@remotion/light-leaks';
import {Audio} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
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

export const MyCompositionSchema = z.object({
	platform: z.enum(['youtube', 'x', 'linkedin']),
});

export type MyCompositionProps = z.infer<typeof MyCompositionSchema>;

export const VIDEO_FILES = [
	'whats1.mov',
	'whats2.mov',
	'whats3.mov',
	'whats4.mov',
	'whats5.mov',
	'whats6.mov',
	'whats7.mov',
	'whats8.mov',
	'whats9.mov',
	'whats10.mov',
	'whats11.mov',
];

// Leading silence end (seconds) and trailing silence start (seconds) for each video
// Detected via ffmpeg silencedetect using adaptive per-video EBU R128 loudness threshold
export const SILENCES: Record<
	string,
	{leadingEnd: number; trailingStart: number}
> = {
	'whats1.mov': {leadingEnd: 0.9, trailingStart: 4.67},
	'whats2.mov': {leadingEnd: 6.37, trailingStart: 31.8},
	'whats3.mov': {leadingEnd: 2.3, trailingStart: 44.5},
	'whats4.mov': {leadingEnd: 1.5, trailingStart: 38.77},
	'whats5.mov': {leadingEnd: 3.04, trailingStart: 25.31},
	'whats6.mov': {leadingEnd: 2.32, trailingStart: 31.64},
	'whats7.mov': {leadingEnd: 4.21, trailingStart: 39.27},
	'whats8.mov': {leadingEnd: 2.7, trailingStart: 29},
	'whats9.mov': {leadingEnd: 1.5, trailingStart: 18.5},
	'whats10.mov': {leadingEnd: 1.84, trailingStart: 15.85},
	'whats11.mov': {leadingEnd: 3.27, trailingStart: 28},
};

export const MyComposition: React.FC<MyCompositionProps> = ({platform}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence
					durationInFrames={114}
					premountFor={30}
					name="Intro"
				>
					<Scene1 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={763}
					premountFor={30}
					name="Light Leaks"
				>
					<Scene2 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={15}>
					<AbsoluteFill>
						<LightLeak seed={14} style={{opacity: 0.7}} />
					</AbsoluteFill>
					<AbsoluteFill>
						<LightLeak seed={10} style={{opacity: 0.7}} />
					</AbsoluteFill>
					<Audio
						name="Light leak whoosh"
						src="https://remotion.media/whoosh.wav"
						volume={0.1}
					/>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					durationInFrames={1266}
					premountFor={30}
					name="Sound Effects"
				>
					<Scene3 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={15}>
					<AbsoluteFill>
						<LightLeak seed={8} style={{opacity: 0.7}} />
					</AbsoluteFill>
					<AbsoluteFill>
						<LightLeak seed={19} style={{opacity: 0.7}} />
					</AbsoluteFill>
					<Audio
						name="Light leak whoosh"
						src="https://remotion.media/whoosh.wav"
						volume={0.1}
					/>
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					durationInFrames={1119}
					premountFor={30}
					name="Render on Vercel"
				>
					<Scene4 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={669}
					premountFor={30}
					name="New Skills"
				>
					<Scene5 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={881}
					premountFor={30}
					name="Web Renderer Progress"
				>
					<Scene6 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={1053}
					premountFor={30}
					name="Work better with Agents"
				>
					<Scene7 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={789}
					premountFor={30}
					name="Rspack"
				>
					<Scene8 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={510}
					premountFor={30}
					name="Preview: Visual Mode"
				>
					<Scene9 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={421}
					premountFor={30}
					name="Mediabunny"
				>
					<Scene10 />
				</TransitionSeries.Sequence>
				<TransitionSeries.Sequence
					durationInFrames={742}
					premountFor={30}
					name="Outro"
				>
					<Scene11 platform={platform} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
